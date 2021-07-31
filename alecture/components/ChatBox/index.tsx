import React, { useCallback, useEffect, useRef } from "react"
import { ChatArea, EachMention, Form, MentionsTextarea, SendButton, Toolbox } from './styles';
import autosize from 'autosize';
import {Mention, SuggestionDataItem} from "react-mentions";
import useSWR from 'swr';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import gravatar from "gravatar";


interface Props{
    chat : string,
    onSubmitForm : (e:any) => void,
    onChangeChat : (e:any) => void,
    placeholder? : string,
}

const ChatBox : React.FC<Props> = ({chat,onSubmitForm,onChangeChat,placeholder}) => {

    const {workspace} = useParams<{workspace : string}>();
    
    const {data:UserData,error,revalidate,mutate} = useSWR<IUser|false>("/api/users",fetcher,{dedupingInterval : 2000});

    const {data : memberData} = useSWR<IUser[]>(UserData ? `/api/workspaces/${workspace}/members` : null , fetcher);


    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        if(textareaRef.current){
            autosize(textareaRef.current);
        }
        return () => {
            
        }
    }, [])

    const onKeyDownChat = useCallback(
        (e:any) => {
            if(e.key === "Enter"){
                if(!e.shiftKey){
                    // console.log("enter");
                    e.preventDefault();
                    onSubmitForm(e);
                }                
            }
            
        },
        [onSubmitForm])

        const renderSuggestion = useCallback(
            (
                suggestion: SuggestionDataItem, search: string, highlightedDisplay: React.ReactNode, index: number, focused: boolean
            )  : React.ReactNode => {
                // console.log(`suggestion : ${suggestion.display} , search : ${search}`);
                if(!memberData) return;
                return(
                    <EachMention focus = {focused}>
                        <img src={gravatar.url(memberData[index].email,{s:"20px" , d:"retro"})} alt={memberData[index].nickname}/>
                        <span>{highlightedDisplay}</span>
                    </EachMention>
                )
            },
            [memberData],
        )

    return (
        <ChatArea>
            <Form onSubmit = {(e) => onSubmitForm(e)}>
                <MentionsTextarea
                id="editor-chat"
                value={chat}
                onChange={onChangeChat}
                onKeyDown = {(e) => onKeyDownChat(e)}
                placeholder={placeholder}
                inputRef={textareaRef}
                allowSuggestionsAboveCursor
                >
                    <Mention appendSpaceOnAdd trigger = "@" data = {memberData?.map(value => {
                        return {
                            id : value.id,
                            display : value.nickname,
                        }
                    }) || []} renderSuggestion = {renderSuggestion}/>
                </MentionsTextarea>
                <Toolbox>
                    <SendButton
                        className={
                        'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
                        (chat?.trim() ? '' : ' c-texty_input__button--disabled')
                        }
                        data-qa="texty_send_button"
                        aria-label="Send message"
                        data-sk="tooltip_parent"
                        type="submit"
                        disabled={!chat?.trim()}
                    >
                        <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
                    </SendButton>
                </Toolbox>
            </Form>
        </ChatArea>
    )

}

export default ChatBox;