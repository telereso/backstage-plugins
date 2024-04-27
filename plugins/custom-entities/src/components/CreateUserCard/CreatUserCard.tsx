import {
    UserEntity,
    // GroupEntity,
    // SystemEntity,
} from '@backstage/catalog-model';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import React from 'react';
import {Input} from "@material-ui/core";

export const DEFAULT_USER: UserEntity = {
    apiVersion: "backstage.io/v1alpha1",
    kind: "User",
    metadata: {
        name: ""
    },
    spec: {
        memberOf: []
    },
}

/** @public */
export const CreatUserCard = (props: {
    disabled: boolean,
    onChange?: (user: UserEntity) => void
}) => {

    const [, setUser] = React.useState<UserEntity>(DEFAULT_USER);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(prevState => {
            const newState = {...prevState, metadata: {...prevState.metadata, name: event.target.value}}
            props.onChange?.(newState)
            return newState
        })
    }

    const handleGoogleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(prevState => {
            const newState = {...prevState, metadata: {...prevState.metadata, "google.com/email": event.target.value}}
            if (event.target.value === "") {
                delete (newState as any).metadata["google.com/email"]
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const deleteProfileIfNeeded = (newState: any) => {
        if (Object.keys(newState.spec.profile).length === 0)
            delete (newState as any).spec.profile
    }

    const handleDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(prevState => {
            const newState = {
                ...prevState,
                spec: {...prevState.spec, profile: {...prevState.spec.profile, displayName: event.target.value}}
            }
            if (event.target.value === "") {
                delete (newState as any).spec?.profile?.displayName
                deleteProfileIfNeeded(newState)
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(prevState => {
            const newState = {
                ...prevState,
                spec: {...prevState.spec, profile: {...prevState.spec.profile, email: event.target.value}}
            }
            if (event.target.value === "") {
                delete (newState as any).spec?.profile?.email
                deleteProfileIfNeeded(newState)
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const handleMembersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(prevState => {
            const newState = {
                ...prevState,
                spec: {
                    ...prevState.spec,
                    memberOf: event.target.value.split(",").filter((e) => e !== "")
                }
            }
            props.onChange?.(newState)
            return newState
        })
    }

    return (
        <List>
            <ListItem>
                <Input placeholder={"Name"} required={true} onChange={handleNameChange}
                       disabled={props.disabled}/>
            </ListItem>
            <ListItem>
                <Input placeholder={"Google Email"} onChange={handleGoogleEmailChange}
                       disabled={props.disabled}/>
            </ListItem>
            <ListItem>
                <Input placeholder={"email"} onChange={handleEmailChange}
                       disabled={props.disabled}/>
            </ListItem>
            <ListItem>
                <Input placeholder={"Display Name"} onChange={handleDisplayNameChange}
                       disabled={props.disabled}/>
            </ListItem>
            <ListItem>
                <Input placeholder={"memberOf"} onChange={handleMembersChange}
                       disabled={props.disabled}/>
            </ListItem>
        </List>
    );
};

// Setting default value for props
CreatUserCard.defaultProps = {
    disabled: false,
};