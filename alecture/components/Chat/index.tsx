import { IChat, IDM } from '@typings/db';
import React , {memo , useMemo} from "react"
import { ChatWrapper } from './styles';
import gravatar from "gravatar"
import dayjs from "dayjs";
import regexifyString from "regexify-string";
import { Link, useParams } from 'react-router-dom';


interface Props{
    data : IDM | IChat,
}

const Chat : React.VFC<Props> = ({data}) => {
    

    const { workspace } = useParams<{workspace : string}>();


    //@[사용자이름](사용자아이디)
    //\d 숫자 +는 1개 이상 ?는 0개 이상 g는 모두찾기
    const result = useMemo(() => regexifyString({
        input: data.content,
        pattern : /@\[(.+?)\]\((\d+?)\)|\n]/g,
        decorator(match,index){
            const arr : string[] | null = match.match(/@\[(.+?)\]\((\d+?)\)/)!;
            if(arr){
                console.log(arr);
                return(
                    <Link key = {match + index} to = {`/workspace/${workspace}/dm/${arr[2]}`}>
                        @{arr[1]}
                    </Link>
                )
            }
            return <br key = {index}/>
        }
    }),[data.content]);

    const user = "Sender" in data ? data.Sender : data.User;
    
    return <ChatWrapper>
        <div className = "chat-img">
            <img src={gravatar.url(user.email,{s:"36px" , d: "retro"})} alt={user.nickname}/>
        </div>
        <div className="chat-text">
            <div className="chat-user">
                <b>{user.nickname}</b>
                <span>{dayjs(data.createdAt).format("h:mm A")}</span>
            </div>
            <p>{result}</p>
        </div>
    </ChatWrapper>
};

export default memo(Chat);