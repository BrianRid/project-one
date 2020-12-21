
import React, { useMemo, useState, useCallback } from "react";
import { withProps } from "app/utils/withProps";
import { ExplorerItems as SecretOrFileExplorerItems } from "./ExplorerItems";
import type { Props as ItemsProps } from "./ExplorerItems";
import { ExplorerItemCreationDialog as SecretOrFileItemCreationDialog } from "app/components/Explorer/ExplorerItemCreationDialog";
import type { Props as DialogProps } from "./ExplorerItemCreationDialog";
import { PathNavigator } from "./PathNavigator";
import type { Props as PathNavigatorProps } from "./PathNavigator";
import { ExplorerButtonBar as SecretOrFileExplorerButtonBar } from "./ExplorerButtonBar";
import { Props as ButtonBarProps } from "./ExplorerButtonBar";
import { Evt } from "evt";
import { join as pathJoin } from "path";
import type { UnpackEvt } from "evt";


export type Props = {
    /** [HIGHER ORDER] */
    type: "secret" | "file";
    /** [HIGHER ORDER] */
    getIsValidBasename(params: { basename: string; }): boolean;

    currentPath: string;
    isNavigating: boolean;
    file: React.ReactNode;
    files: string[];
    directories: string[];
    directoriesBeingCreatedOrRenamed: string[];
    filesBeingCreatedOrRenamed: string[];
    onNavigate(params: { kind: "file" | "directory"; relativePath: string; }): void;
    onEditedBasename(params: { kind: "file" | "directory"; basename: string; editedBasename: string; }): void;
    onDeleteItem(params: { kind: "file" | "directory"; basename: string; }): void;
    onCreateItem(params: { kind: "file" | "directory"; basename: string; }): void;
    onCopyPath(params: { path: string; }): void;

};

export function Explorer(props: Props) {

    const {
        type,
        getIsValidBasename,
        currentPath,
        files,
        directories,
        filesBeingCreatedOrRenamed,
        directoriesBeingCreatedOrRenamed,
        onNavigate,
        onEditedBasename: onEditBasename,
        onCopyPath,
        onDeleteItem,
        onCreateItem
    } = props;

    const Items = useMemo(
        () => withProps(
            SecretOrFileExplorerItems,
            {
                "visualRepresentationOfAFile": type,
                getIsValidBasename
            }
        ),
        [type, getIsValidBasename]
    );

    const ItemCreationDialog = useMemo(
        () => withProps(
            SecretOrFileItemCreationDialog,
            { "wordForFile": type }
        ),
        [type]
    );

    const ButtonBar = useMemo(
        () => withProps(
            SecretOrFileExplorerButtonBar,
            { "wordForFile": type }
        ),
        [type]
    );

    const [{ evtItemsAction, evtDialogAction }] = useState(() => ({
        "evtItemsAction": Evt.create<UnpackEvt<ItemsProps["evtAction"]>>(),
        "evtDialogAction": Evt.create<UnpackEvt<DialogProps["evtAction"]>>()
    }));

    const buttonBarCallback = useCallback(
        ({ action }: Parameters<ButtonBarProps["callback"]>[0]) => {

            switch (action) {
                case "rename":
                    evtItemsAction.post("START EDITING SELECTED ITEM BASENAME");
                    break;
                case "delete":
                    evtItemsAction.post("DELETE SELECTED ITEM");
                    break;
                case "copy path":
                    evtItemsAction.post("COPY SELECTED ITEM PATH");
                    break;
                case "create directory":
                case "create file":

                    evtDialogAction.post({
                        "action": "OPEN",
                        "kind": (() => {
                            switch (action) {
                                case "create file": return "file";
                                case "create directory": return "directory"
                            }

                        })()
                    });

                    break;

            }

        },
        [evtItemsAction, evtDialogAction]
    );

    const dialogGetIsValidBasename = useCallback(
        ({ kind, basename }: Parameters<DialogProps["getIsValidBasename"]>[0]) => (
            getIsValidBasename({ basename }) &&
            !(() => {
                switch (kind) {
                    case "directory": return directories;
                    case "file": return files;
                }
            })().includes(basename)
        ),
        [directories, files, getIsValidBasename]
    );


    const [isThereAnItemSelected, setIsThereAnItemSelected] = useState(false);

    const onIsThereAnItemSelectedValueChange = useCallback(
        ({ isThereAnItemSelected }: Parameters<ItemsProps["onIsThereAnItemSelectedValueChange"]>[0]) =>
            setIsThereAnItemSelected(isThereAnItemSelected),
        []
    );


    const pathNavigatorCallback = useCallback(
        ({ relativePath }: Parameters<PathNavigatorProps["callback"]>[0]) => {
            onNavigate({
                "kind": "directory",
                relativePath
            })
        },
        [onNavigate]
    );


    const itemsOnNavigate = useCallback(
        ({ kind, basename }: Parameters<ItemsProps["onNavigate"]>[0]) =>
            onNavigate({
                kind,
                "relativePath": pathJoin(currentPath, basename)
            }),

        [onNavigate, currentPath]
    );

    const itemsOnCopyPath = useCallback(
        ({ basename }: Parameters<ItemsProps["onCopyPath"]>[0]) =>
            onCopyPath({
                "path": pathJoin(currentPath, basename)
            }),

        [onCopyPath, currentPath]

    );

    const itemsOnDeleteItem = useCallback(
        ({ kind, basename }: Parameters<ItemsProps["onDeleteItem"]>[0]) =>
            onDeleteItem({ kind, basename }),
        [onDeleteItem]
    );

    return (
        <>
            <ItemCreationDialog
                evtAction={evtDialogAction}
                getIsValidBasename={dialogGetIsValidBasename}
                successCallback={onCreateItem}
            />
            <ButtonBar
                isThereAnItemSelected={isThereAnItemSelected}
                callback={buttonBarCallback}
            />
            <PathNavigator
                minDepth={0}
                path={currentPath}
                callback={pathNavigatorCallback}
            />
            <Items
                files={files}
                directories={directories}
                filesBeingCreatedOrRenamed={filesBeingCreatedOrRenamed}
                directoriesBeingCreatedOrRenamed={directoriesBeingCreatedOrRenamed}
                onNavigate={itemsOnNavigate}
                onEditBasename={onEditBasename}
                evtAction={evtItemsAction}
                onIsThereAnItemSelectedValueChange={onIsThereAnItemSelectedValueChange}
                onCopyPath={itemsOnCopyPath}
                onDeleteItem={itemsOnDeleteItem}
            />
        </>
    );

}
