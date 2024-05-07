import {
    Entity,
    GroupEntity, SystemEntity,
    UserEntity,
    // GroupEntity,
    // SystemEntity,
} from '@backstage/catalog-model';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import React, {useEffect} from 'react';
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

export const DEFAULT_GROUP: GroupEntity = {
    apiVersion: "backstage.io/v1alpha1",
    kind: "Group",
    metadata: {
        name: ""
    },
    spec: {
        type: "team",
        children: [],
        members: []
    },
}

export const defaultByKind = (kind: string) => {
    switch (kind) {
        case "System":
            return DEFAULT_SYSTEM
        case "Group":
            return DEFAULT_GROUP
        default:
            return DEFAULT_USER
    }
}

export const DEFAULT_SYSTEM: SystemEntity = {
    apiVersion: "backstage.io/v1alpha1",
    kind: "System",
    metadata: {
        name: ""
    },
    spec: {
        owner: "",
        domain: ""
    },
}

/** @public */
export const CreateEntityCard = (props: {
    kind: string,
    disabled: boolean,
    onChange?: (entity: Entity) => void
}) => {

    const [entity, setEntity] = React.useState<Entity>(defaultByKind(props.kind));

    useEffect(() => {
        const e = defaultByKind(props.kind)
        setEntity(e)
        props.onChange?.(e)
    }, [props.kind])

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntity(prevState => {
            const newState = {...prevState, metadata: {...prevState.metadata, name: event.target.value.trim().replaceAll(" ","")}}
            props.onChange?.(newState)
            return newState
        })
    }

    const handleGoogleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntity(prevState => {
            const newState = {...prevState, metadata: {...prevState.metadata, "google.com/email": event.target.value.trim().replaceAll(" ","")}}
            if (event.target.value.trim() === "") {
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
        setEntity(prevState => {
            const pv = prevState as UserEntity
            const newState = {
                ...prevState,
                spec: {...prevState.spec, profile: {...pv.spec.profile, displayName: event.target.value.trim()}}
            }
            if (event.target.value.trim() === "") {
                delete (newState as any).spec?.profile?.displayName
                deleteProfileIfNeeded(newState)
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntity(prevState => {
            const pv = prevState as UserEntity
            const newState = {
                ...prevState,
                spec: {
                    ...prevState.spec,
                    profile: {...pv.spec.profile, email: event.target.value.trim().replaceAll(" ", "")}
                }
            }
            if (event.target.value.trim() === "") {
                delete (newState as any).spec?.profile?.email
                deleteProfileIfNeeded(newState)
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const handleMembersOfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntity(prevState => {
            const newState = {
                ...prevState,
                spec: {
                    ...prevState.spec,
                    memberOf: event.target.value.trim().split(",").filter((e) => e !== "")
                }
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const handleMembersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntity(prevState => {
            const newState = {
                ...prevState,
                spec: {
                    ...prevState.spec,
                    members: event.target.value.trim().split(",").filter((e) => e !== "")
                }
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntity(prevState => {
            const newState = {
                ...prevState,
                spec: {
                    ...prevState.spec,
                    type: event.target.value.trim()
                }
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const handleChildrenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntity(prevState => {
            const newState = {
                ...prevState,
                spec: {
                    ...prevState.spec,
                    children: event.target.value.trim().split(",").filter((e) => e !== "")
                }
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const handleDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntity(prevState => {
            const newState = {
                ...prevState,
                spec: {
                    ...prevState.spec,
                    domain: event.target.value.trim()
                }
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const handleOwnerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntity(prevState => {
            const newState = {
                ...prevState,
                spec: {
                    ...prevState.spec,
                    owner: event.target.value.trim()
                }
            }
            props.onChange?.(newState)
            return newState
        })
    }

    const getEmail = () => {
        if (!entity) return ""
        switch (props.kind) {
            case "User":
                return (entity as UserEntity).spec?.profile?.email || "";
            default:
                return "";
        }
    }

    const isUser = () => {
        return props.kind == "User"
    }
    const isGroup = () => {
        return props.kind == "Group"
    }

    const isSystem = () => {
        return props.kind == "System"
    }

    return (
        <List>
            <ListItem>
                <Input placeholder="Name" required onChange={handleNameChange}
                       value={entity?.metadata?.name || ""}
                       disabled={props.disabled}/>
            </ListItem>
            {isUser() && <ListItem>
                <Input placeholder="Google Email" onChange={handleGoogleEmailChange}
                       value={entity?.metadata["google.com/email"] || ""}
                       disabled={props.disabled}/>
            </ListItem>}
            {isUser() && <ListItem>
                <Input placeholder="Email" onChange={handleEmailChange}
                       value={getEmail()}
                       disabled={props.disabled}/>
            </ListItem>}
            {isUser() && <ListItem>
                <Input placeholder="Display Name" onChange={handleDisplayNameChange}
                       disabled={props.disabled}/>
            </ListItem>}
            {isUser() && <ListItem>
                <Input placeholder="MemberOf" onChange={handleMembersOfChange}
                       disabled={props.disabled}/>
            </ListItem>}
            {isGroup() && <ListItem>
                <Input placeholder="Type" onChange={handleTypeChange}
                       disabled={props.disabled}/>
            </ListItem>}
            {isGroup() && <ListItem>
                <Input placeholder="Children" onChange={handleChildrenChange}
                       disabled={props.disabled}/>
            </ListItem>}
            {isGroup() && <ListItem>
                <Input placeholder="Members" onChange={handleMembersChange}
                       disabled={props.disabled}/>
            </ListItem>}
            {isSystem() && <ListItem>
                <Input placeholder="Owner" onChange={handleOwnerChange}
                       disabled={props.disabled}/>
            </ListItem>}
            {isSystem() && <ListItem>
                <Input placeholder="Domain" onChange={handleDomainChange}
                       disabled={props.disabled}/>
            </ListItem>}
        </List>
    );
};

// Setting default value for props
CreateEntityCard.defaultProps = {
    kind: "User",
    disabled: false,
};