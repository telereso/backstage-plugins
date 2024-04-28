import React, {useEffect, useState} from 'react';
import {Button, Grid} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import {useApi} from '@backstage/core-plugin-api';


import {
    Header,
    Page,
    Content,
    ContentHeader,
    HeaderLabel,
    SupportButton,
} from '@backstage/core-components';
import Editor, {DiffEditor} from '@monaco-editor/react';
import {DEFAULT_USER, CreatUserCard} from "../CreateUserCard";
import {Entity} from "@backstage/catalog-model";
import {Document} from "yaml";
import {editor} from "monaco-editor";
import {CustomEntitiesApiRef} from "../../api/CustomEntitiesAPI";

const entityToYaml = (entity: Entity) => {
    const yaml = new Document();
    yaml.contents = JSON.parse(JSON.stringify(entity))
    return yaml
}

const entityToYamlString = (entity: Entity) => {
    return entityToYaml(entity).toString()
}

const entitiesToYamlString = (entities: Entity[]) => {
    let res = entities.map((e => {
        return entityToYamlString(e)
    })).join("\n---\n")
    if (entities.length > 0)
        res = res.concat("\n---\n")
    return res
}

const isEmptyEntity = (entity: Entity) => {
    return entity.metadata.name === ""
}

const styleSpace = {
    marginTop: "105px",
    marginLeft: "30px"
}
export const PageComponent = () => {
    const customEntitiesApi = useApi(CustomEntitiesApiRef);
    const [originalEntitiesYaml, setOriginalEntitiesYaml] = useState<string>()
    const [entitiesYamlEditor, setEntitiesYamlEditor] = useState<editor.IStandaloneDiffEditor>()
    const [savingState, setSavingState] = useState<boolean>(false)

    const [newEntities, setNewEntities] = useState<Entity[]>([])
    const [newEntity, setNewEntity] = useState<Entity>()
    const [resetNewEntity, setRestNewEntity] = useState(0)

    // fetch entities.yaml
    useEffect(() => {
        customEntitiesApi.fetchCustomEntitiesYaml()
            .then((data) => setOriginalEntitiesYaml(data))
    }, [customEntitiesApi])

    const handleEntityChange = (e: Entity) => {
        if (isEmptyEntity(e)) {
            if (newEntity)
                setNewEntity(undefined)
        } else
            setNewEntity(e)
    }

    const addEntityClicked = () => {
        if (newEntity && !savingState) {
            setNewEntities(prevState => [newEntity, ...prevState])
            setNewEntity(undefined)
            setRestNewEntity((prevState) => prevState + 1)
        }
    }

    const onEntitiesYamlMount = (e: editor.IStandaloneDiffEditor) => {
        setEntitiesYamlEditor(e)
    }

    const onSaveClicked = () => {
        if (entitiesYamlEditor && !savingState) {
            setSavingState(true)
            customEntitiesApi.saveCustomEntitiesYaml(
                entitiesYamlEditor.getModifiedEditor().getValue().toString()
            ).then(() => {
                setNewEntities([])
            }).finally(() => {
                customEntitiesApi
                    .fetchCustomEntitiesYaml()
                    .then((data) => setOriginalEntitiesYaml(data))
                    .finally(() => {
                        setSavingState(false)
                    })
            })
        }
    }


    const modifiedEntitiesYaml = entitiesYamlEditor?.getModifiedEditor()?.getValue()

    return (
        <Page themeId="tool">
            <Header title="Custom Entiets" subtitle="Dashboard">
                <HeaderLabel label="Owner" value="Telereso"/>
                <HeaderLabel label="Lifecycle" value="Experimental"/>
            </Header>
            <Content>
                <ContentHeader title="Create User">
                    <SupportButton>Here you can add users & groups to your organization</SupportButton>
                </ContentHeader>
                <Grid container spacing={2}>
                    <Grid item xs={2}>
                        <CreatUserCard key={resetNewEntity} onChange={handleEntityChange} disabled={savingState}/>
                    </Grid>
                    <Grid item xs={3}>
                        <Editor height="32vh"
                                defaultLanguage="yaml"
                                defaultValue={entityToYamlString(DEFAULT_USER)}
                                options={{
                                    readOnly: savingState,
                                    lineDecorationsWidth: 0,
                                    lineNumbersMinChars: 2,
                                    minimap: {
                                        enabled: false,
                                    },
                                    scrollbar: {
                                        vertical: "auto",
                                        verticalScrollbarSize: 2,
                                        horizontalScrollbarSize: 2
                                    }
                                }}
                                value={entityToYamlString(newEntity ?? DEFAULT_USER)}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <div style={styleSpace}
                             onClick={addEntityClicked}>
                            <ArrowForwardIcon color={(newEntity && !savingState) ? "primary" : "disabled"}/>
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <DiffEditor height="60vh"
                                    originalLanguage="yaml"
                                    modifiedLanguage="yaml"
                                    language="yaml"
                                    options={{
                                        readOnly: savingState,
                                        enableSplitViewResizing: false,
                                        renderSideBySide: false,
                                        lineDecorationsWidth: 3,
                                        lineNumbersMinChars: 3,
                                        scrollbar: {
                                            vertical: "auto",
                                            verticalScrollbarSize: 2,
                                            horizontalScrollbarSize: 2
                                        }
                                    }}
                                    onMount={onEntitiesYamlMount}
                                    original={originalEntitiesYaml}
                                    modified={entitiesToYamlString(newEntities)
                                        .concat(originalEntitiesYaml ?? "")}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <Button style={styleSpace}
                                disabled={
                                    savingState ||
                                    (
                                        newEntities.length === 0
                                        && entitiesYamlEditor
                                        && !modifiedEntitiesYaml
                                    )
                                }
                                variant="outlined"
                                onClick={onSaveClicked}>
                            {savingState ? <CircularProgress size={24}/> : 'Save'}
                        </Button>
                    </Grid>
                </Grid>
            </Content>
        </Page>
    );
}
