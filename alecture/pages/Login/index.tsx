import useInput from '@hooks/useInput';
import { Button, Error, Form, Header, Input, Label, LinkContainer } from '@pages/Login/style';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Redirect,Link, Route } from 'react-router-dom';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import { toast } from 'react-toastify';


const LogIn = () => {
  const {data,error,revalidate} = useSWR("/api/users",fetcher);

    const [email, onChangeEmail] = useInput('');
    const [password, onChangePassword] = useInput('');
    const [logInError, setLogInError] = useState(false);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLogInError(false);
      axios
        .post(
          '/api/users/login',
          { email, password },
          {
            withCredentials: true,
          },
        )
        .then(() => {
          revalidate(); 
        })
        .catch((error) => {
          setLogInError(error.response?.data?.statusCode === 401);
          toast.error("로그인 실패",{position : "bottom-center",autoClose : 2000});
        });
    },
    [email, password],
  );

  if (data) {
    console.log('로그인됨', data);
    return <Redirect to="/workspace/sleact/channel/일반" />;
   }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to ="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;