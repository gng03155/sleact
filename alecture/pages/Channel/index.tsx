import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from 'react-router';
import useSWR, { useSWRInfinite } from 'swr';
import { Container , Header } from './styles';
import gravatar from "gravatar";
import { IChannel, IChat, IUser } from '@typings/db';
import axios from 'axios';
import { toast } from 'react-toastify';
import InviteChannelModal from '@components/InviteChannelModal';
import ScrollBars from "react-custom-scrollbars";


const Channel = () => {

    const { workspace  , channel} = useParams<{workspace : string ,  channel : string}>();

    const {data : myData} = useSWR("/api/users",fetcher);

    const {data : channelData} = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`,fetcher)

    const { data: chatData, mutate: mutateChat, setSize ,revalidate} = useSWRInfinite<IChat[]>(
        (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
        fetcher,
      );

      const { data: channelMemberData} = useSWR<IUser[]>( myData? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
        fetcher,
      );

    const [socket] = useSocket(workspace);

    const isEmpty = chatData?.[0]?.length === 0;
    const isReachingEnd = isEmpty || (chatData && chatData[chatData.length -1]?.length < 20) || false;

    const [chat , onChangeChat , setChat] = useInput("");


    const scrollbarRef = useRef<ScrollBars>(null);

    const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

    

    const onSubmitForm = useCallback(
        (e) => {
            e.preventDefault();
            if(chat?.trim() && chatData && channelData ){
                const savedChat = chat;
                mutateChat((prevChatData) => {
                    prevChatData?.[0].unshift({
                        id: (chatData[0][0]?.id || 0) + 1,
                        content: savedChat,
                        UserId : myData.id,
                        User: myData,
                        ChannelId : channelData.id,
                        Channel : channelData,
                        createdAt: new Date(),
                    })
                    return prevChatData;
                },false)
                .then(()=>{
                    setChat("");
                    scrollbarRef.current?.scrollToBottom();
                });
                axios.post(`/api/workspaces/${workspace}/channels/${channel}/chats`,{
                    content : chat,
                })
                .then(()=> {
                    revalidate();
                })
                .catch(err => {
                    console.log(err);
                })
            }
        },
        [chat,chatData,myData,channelData,workspace,channel],
    )

    const onMessage = useCallback(
        (data : IChat) => {
            //id는 상대방 아이디
            if (data.Channel.name === channel && myData.id !== myData?.id) {
                mutateChat((chatData) => {
                  chatData?.[0].unshift(data);
                  return chatData;
                }, false).then(() => {
                  if (scrollbarRef.current) {
                    if (
                      scrollbarRef.current.getScrollHeight() <
                      scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
                    ) {
                      console.log('scrollToBottom!', scrollbarRef.current?.getValues());
                      scrollbarRef.current.scrollToBottom();
                    } else {
                      toast.success('새 메시지가 도착했습니다.', {
                        onClick() {
                          scrollbarRef.current?.scrollToBottom();
                        },
                        closeOnClick: true,
                      });
                    }
                  }
                });
              }
        },
        [channel,chatData,myData],
    )

    useEffect(() => {
       socket?.on('message',onMessage);
       return () => {
        socket?.off('message',onMessage);
       }
    }, [socket , onMessage])

    //로딩 시 스크롤바 제일 아래
    useEffect(() => {
        if(chatData?.length === 1){
            scrollbarRef.current?.scrollToBottom();
        }
    }, [chatData])

    const onClickInviteChannel = useCallback(
        () => {
            setShowInviteChannelModal(true);
        },
        [],
    )

    const onCloseModal = useCallback(
        () => {
            setShowInviteChannelModal(false);
        },
        [],
    )

    if(!myData || !myData){
        return null;
    }

    const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

    return (
        <Container>
            <Header>
                <span>#{channel}</span>
                <div className = "header-right" style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <span>{channelMemberData?.length}</span>
                    <button onClick={onClickInviteChannel}
                            className="c-button-unstyled p-ia__view_header__button"
                            aria-label="Add people to #react-native"
                            data-sk="tooltip_parent"
                            type="button">
                            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
                    </button>
                </div>
            </Header>
            <ChatList chatSections = {chatSections} scrollRef = {scrollbarRef} setSize = {setSize} isEmpty = {isEmpty} isReachingEnd = {isReachingEnd}/>
            <ChatBox chat = {chat} onChangeChat = {onChangeChat} onSubmitForm = {onSubmitForm} />
            <InviteChannelModal
            show={showInviteChannelModal}
            onCloseModal={onCloseModal}
            setShowInviteChannelModal={setShowInviteChannelModal}/>
        </Container>
        
    )
}

export default Channel;