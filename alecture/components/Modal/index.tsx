import { CloseModalButton } from '@components/Menu/styles';
import React from "react"
import { useCallback } from 'react';
import { CreateModal } from './styles';

interface Props{
    show : boolean,
    onCloseModal : () => void,
}

const Modal : React.FC<Props> = ({show,onCloseModal,children}) => {
    
    const stopPropagation = useCallback(
        (e) => {
            e.stopPropagation();
        },
        [],
    )

    if(!show){
        return null;
    }

    
    return(
        <CreateModal onClick = {onCloseModal}>
            <div onClick = {stopPropagation}>
                <CloseModalButton onClick = {onCloseModal}>x</CloseModalButton>
                {children}
            </div>
        </CreateModal>
    );
}


export default Modal;