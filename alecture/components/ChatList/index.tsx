import Chat from '@components/Chat';
import { IChat, IDM } from '@typings/db';
import React, { useCallback , forwardRef, RefObject } from "react";
import { ChatZone, Section, StickyHeader } from './styles';
import {Scrollbars} from "react-custom-scrollbars";
interface Props{
    chatSections : {[key:string] : (IDM | IChat)[]},
    setSize : (f: (size:number) => number) => Promise<(IDM | IChat)[][] | undefined>,
    isEmpty : boolean,
    isReachingEnd : boolean,
    scrollRef : RefObject<Scrollbars>
}

const ChatList :React.FC<Props> = ({chatSections,setSize,isEmpty,isReachingEnd, scrollRef}) => {
    const onScroll = useCallback(
        (values) => {
            if(values.scrollTop === 0 && !isReachingEnd){
                console.log("Top");
                //데이터 추가 로딩
                setSize((prevSize) => prevSize + 1)
                .then(()=>{
                    // 스크롤 위치 유지
                    scrollRef.current?.scrollTop(scrollRef.current?.getScrollHeight() - values.scrollHeight)
                })
                
            }
        },
        [],
    )

    return(
        <ChatZone>
            <Scrollbars autoHide ref={scrollRef} onScrollFrame = {onScroll}>
                {Object.entries(chatSections).map(([date,chats])=>{
                    return(
                        <Section className = {`section-${date}`} key = {date}>
                            <StickyHeader>
                                <button>{date}</button>
                            </StickyHeader>
                            {chats?.map(chat => {
                            return (
                                <Chat key = {chat.id} data = {chat} />
                            )
                            })}
                        </Section>
                    )
                })}
            </Scrollbars>
        </ChatZone>
    );
};

export default ChatList;