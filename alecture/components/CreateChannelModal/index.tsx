import { CloseModalButton } from '@components/Menu/styles';
import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/SignUp/style';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React from "react"
import { useCallback } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface Props{
    show : boolean,
    onCloseModal : () => void,
    setShowCreateChannelModal : (flag : boolean) => void,
}

const CreateChannelModal : React.FC<Props> = ({onCloseModal,show,setShowCreateChannelModal}) => {

    const [newChannel , onChangeNewChannel , setNewChannel] = useInput("")

    const {workspace,channel} = useParams<{workspace : string , channel : string}>();
    const {data:UserData,error,revalidate,mutate} = useSWR<IUser|false>("/api/users",fetcher,{dedupingInterval : 2000});

    const {data : channelData, revalidate : revaildateChannel} = useSWR<IChannel[]>(UserData ? `/api/workspaces/${workspace}/channels` : null , fetcher);

    console.log(UserData , channelData);

    const onCreateChannel = useCallback(
        (e) => {
            e.preventDefault();
            axios.post(`/api/workspaces/${workspace}/channels`,{
                name : newChannel,
            })
            .then((response) => {
                setShowCreateChannelModal(false);
                revaildateChannel();
                setNewChannel("");
            })
            .catch((err) => {
                console.dir(err);
                toast.error(err.response?.data, {position : "bottom-center"})
            })
        },[newChannel]);
    
    return(
        <Modal show = {show}  onCloseModal = {onCloseModal}>
            <form onSubmit = {onCreateChannel}>
                <Label id = "channel-label">
                    <span>채널</span>
                    <Input id = "workspace" value = {newChannel} onChange = {onChangeNewChannel}></Input>
                </Label>
                <Button type = "submit">생성하기</Button>
            </form>
            </Modal>
    );
}


export default CreateChannelModal;