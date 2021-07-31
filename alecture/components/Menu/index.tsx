import React, { CSSProperties, useCallback } from "react";
import { CloseModalButton, CreateMenu } from './styles';

interface MenuProps{
    show : boolean,
    onCloseModal : (e:any) => void,
    style : CSSProperties,
    closeButton? : boolean,
}

const Menu : React.FC<MenuProps> = ({children,style,show,onCloseModal,closeButton = true}) => {

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
        <CreateMenu onClick = {onCloseModal}>
            <div style = {style} onClick = {stopPropagation}>
                {closeButton && 
                <CloseModalButton onClick = {onCloseModal}>&times;</CloseModalButton>}
                {children}
            </div>
        </CreateMenu>
    );
};

// Menu.defaultProps = {
//     closeButton : true,
// }

export default Menu;