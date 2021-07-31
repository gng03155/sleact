import React, { useCallback, useEffect, useState } from "react";
import { AddButton, Channels, Chats, Header, LogOutButton, MenuScroll, ProfileImg, ProfileModal, RightMenu, WorkspaceButton, WorkspaceModal, WorkspaceName, Workspaces, WorkspaceWrapper } from "@layouts/Workspace/styles"
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import { Redirect, Route, Switch, useParams } from 'react-router';
import gravatar from "gravatar";
import Menu from '@components/Menu';
import { Link } from 'react-router-dom';
import { IChannel, IUser } from '@typings/db';
import { Input, Label, Button } from '@pages/SignUp/style';
import useInput from '@hooks/useInput';
import Modal from '@components/Modal';
import { toast } from "react-toastify"
import CreateChannelModal from '@components/CreateChannelModal';
import loadable from '@loadable/component';
import InviteWorkspaceModal from '@components/InviteWorksapceModal';
import InviteChannelModal from '@components/InviteChannelModal';
import ChannelList from '@components/ChannelList';
import DMList from '@components/DMList';
import useSocket from '@hooks/useSocket';
import { isIfStatement } from 'typescript';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));


const Workspace: React.VFC = () => {

    const { workspace, channel } = useParams<{ workspace: string, channel: string }>();

    const { data: UserData, error, revalidate, mutate } = useSWR<IUser | false>("/api/users", fetcher, { dedupingInterval: 2000 });
    const { data: channelData } = useSWR<IChannel[]>(UserData ? `/api/workspaces/${workspace}/channels` : null, fetcher);
    const { data: memberData } = useSWR<IUser[]>(UserData ? `/api/workspaces/${workspace}/members` : null, fetcher);

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
    const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
    const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
    const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
    const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
    const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput("");
    const [newUrl, onChangeNewUrl, setNewUrl] = useInput("");

    const [socket, disconnect] = useSocket(workspace);

    useEffect(() => {
        if (channelData && UserData && socket) {
            socket.emit("login", { id: UserData.id, channels: channelData.map(v => v.id) })
        }

    }, [socket, UserData, channelData])


    useEffect(() => {
        console.log(workspace);
        return () => {
            disconnect();
        }
    }, [workspace, disconnect])

    const onLogout = useCallback(
        () => {
            axios.post("/api/users/logout", null, { withCredentials: true })
                .then(() => {
                    mutate(false, false);
                });
        },
        []);


    const onCloseUserProfile = useCallback(
        () => {
            setShowUserMenu(false);

        },
        [],
    )

    const onClickUserProfile = useCallback(
        (e) => {
            e.stopPropagation();
            setShowUserMenu((prev: boolean) => !prev);
        },
        [],
    )

    const onClickCreateWorkspace = useCallback(
        () => {
            setShowCreateWorkspaceModal(true);
        },
        [],
    )

    const onCreateWorkspace = useCallback(
        (e) => {
            e.preventDefault();
            if (!newWorkspace || !newWorkspace.trim()) return;
            if (!newUrl || !newUrl.trim()) return;
            axios.post("/api/workspaces/", {
                workspace: newWorkspace,
                url: newUrl,
            })
                .then(() => {
                    revalidate();
                    setShowCreateWorkspaceModal(false);
                    setNewWorkspace("");
                    setNewWorkspace("");
                })
                .catch((err) => {
                    console.dir(err);
                    toast.error(err.response?.data, { position: "bottom-center" });
                })

        },
        [newWorkspace, newUrl],
    )


    const onCloseModal = useCallback(
        () => {
            setShowCreateWorkspaceModal(false);
            setShowCreateChannelModal(false);
            setShowInviteWorkspaceModal(false);
            setShowInviteChannelModal(false);
        },
        [],
    )

    const toggleWorkspaceModal = useCallback(
        () => {
            setShowWorkspaceModal((prev: boolean) => !prev);
        },
        []
    )


    const onClickAddChannel = useCallback(
        () => {
            setShowCreateChannelModal(true);
        },
        [],
    )

    const onClickInviteWorkspace = useCallback(
        () => {
            setShowInviteWorkspaceModal(true);
        },
        [],
    )


    if (!UserData) {
        return <Redirect to="/login"></Redirect>

    }

    return (
        <div>
            {/* 고정 Header bar */}
            <Header>
                <RightMenu>
                    {/* 유저 프로필 */}
                    <span onClick={onClickUserProfile}>
                        <ProfileImg
                            src={gravatar.url(UserData.email, { s: "28px", d: "retro" })} alt={UserData.nickname}>
                        </ProfileImg>
                        {/* 유저 프로필 클릭 시 생성되는 모달 */}
                        {showUserMenu &&
                            <Menu style={{ right: 0, top: 38 }}
                                onCloseModal={onClickUserProfile}
                                show={showUserMenu}
                            >
                                <ProfileModal>
                                    <img src={gravatar.url(UserData.nickname, { s: "28px", d: "retro" })} alt={UserData.nickname} />
                                    <div>
                                        <span id="profile-name">{UserData.nickname}</span>
                                        <span id="profile-active">Active</span>
                                    </div>
                                </ProfileModal>
                                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
                            </Menu>
                        }
                    </span>
                </RightMenu>
            </Header>
            {/* 좌측 고정 side bar */}
            <WorkspaceWrapper>
                {/* 워크스페이스 목록 */}
                <Workspaces>
                    {UserData?.Workspaces.map((ws) => {
                        return (
                            <Link key={ws.id} to={`/workspace/${ws.name}/channel/일반`}>
                                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
                            </Link>
                        )
                    })}
                    <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
                </Workspaces>
                {/* 채널 및 DM 목록 */}
                <Channels>
                    {/* 채널 추가 및 워크스페이스 사용자 초대 모달 */}
                    <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
                    <MenuScroll>
                        <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80 }}>
                            <WorkspaceModal>
                                <h2>Sleact</h2>
                                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                                <button onClick={onClickAddChannel}>채널만들기</button>
                                <button onClick={onLogout}>로그아웃</button>
                            </WorkspaceModal>
                        </Menu>
                    </MenuScroll>
                    {/* 채널 리스트 */}
                    <ChannelList />
                    {/* DM 리스트 */}
                    <DMList />
                </Channels>
                <Chats>
                    <Switch>
                        <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
                        <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
                    </Switch>
                </Chats>
            </WorkspaceWrapper>
            <Modal
                show={showCreateWorkspaceModal}
                onCloseModal={onCloseModal}
            >
                <form onSubmit={onCreateWorkspace}>
                    <Label>
                        <span>워크스페이스 이름</span>
                        <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace}></Input>
                    </Label>
                    <Label>
                        <span>워크스페이스 url</span>
                        <Input id="workspace" value={newUrl} onChange={onChangeNewUrl}></Input>
                    </Label>
                    <Button type="submit">생성하기</Button>
                </form>
            </Modal>
            <CreateChannelModal show={showCreateChannelModal} onCloseModal={onCloseModal} setShowCreateChannelModal={setShowCreateChannelModal} />
            <InviteWorkspaceModal show={showInviteWorkspaceModal} onCloseModal={onCloseModal} setShowInviteWorkspaceModal={setShowInviteWorkspaceModal} />
            <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} setShowInviteChannelModal={setShowInviteChannelModal} />

        </div>
    )
}

export default Workspace;