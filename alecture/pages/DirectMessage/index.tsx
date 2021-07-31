import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback, useEffect, useRef } from "react";
import useSWR, { useSWRInfinite } from 'swr';
import { Container, Header } from './styles';
import gravatar from "gravatar";
import { useParams } from 'react-router';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import ScrollBars from "react-custom-scrollbars";
import useSocket from '@hooks/useSocket';
import { toast } from 'react-toastify';


const DirectMessage = () => {

  const { workspace, id } = useParams<{ workspace: string, id: string }>();

  const { data: userData, } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher, { dedupingInterval: 2000 });

  const { data: myData } = useSWR("/api/users", fetcher);

  const { data: chatData, mutate: mutateChat, setSize, revalidate } = useSWRInfinite<IDM[]>(
    (index) => {
      return `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`
    },
    fetcher,
  );

  const [socket] = useSocket(workspace);

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const [chat, onChangeChat, setChat] = useInput("");


  const scrollbarRef = useRef<ScrollBars>(null);



  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          })
          return prevChatData;
        }, false)
          .then(() => {
            setChat("");
            scrollbarRef.current?.scrollToBottom();
          });

        axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
          content: chat,
        })
          .then(() => {
            revalidate();
          })
          .catch(err => {
            console.log(err);
          })
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  )

  const onMessage = useCallback(
    (data: IDM) => {
      //id는 상대방 아이디
      if (data.SenderId === Number(id) && myData.id !== Number(id)) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              // console.log('scrollToBottom!', scrollbarRef.current?.getValues());
              scrollbarRef.current.scrollToBottom();
            } else {
              toast.success('새 메시지가 도착했습니다.', {
                onClick() {
                  scrollbarRef.current?.scrollToBottom();
                },
                closeOnClick: true,
                autoClose: 2000,
              });
            }
          }
        });
      }
    },
    [],
  )

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    }
  }, [socket, onMessage])

  //로딩 시 스크롤바 제일 아래
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData])

  if (!userData || !myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: "24px", d: "retro" })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList chatSections={chatSections} scrollRef={scrollbarRef} setSize={setSize} isEmpty={isEmpty} isReachingEnd={isReachingEnd} />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  )
}

export default DirectMessage;