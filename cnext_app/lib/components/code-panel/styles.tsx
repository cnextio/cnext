import Editor from "@monaco-editor/react";
import styled from "styled-components";

export const MonacoEditor = styled(Editor)`
    --var-color-ok: #42a5f5;
    --var-color-failed: #f30c0c;
    --var-color-executing: #f59242;

    .line-status {
        width: 3px !important;
        margin-left: 5px;
        // margin-top: 0.5px;
        &.first-status {
            margin-top: -5px;
            height: 23px !important;
        }
        &.last-status {
            margin-bottom: -5px;
            height: 24px !important;
        }
        &.ok {
            background: var(--var-color-ok);
        }
        &.failed {
            background: var(--var-color-failed);
        }
        &.executing {
            /* background: var(--var-color-executing); */
            animation: blink 3s infinite;
        }
        @keyframes blink {
            0% {
                background-color: var(--var-color-executing);
            }
            50% {
                background-color: white;
            }
            100% {
                background-color: var(--var-color-executing);
            }
        }
        &.inqueue {
            background: var(--var-color-executing);
        }
    }
    .cellwidget {
        height: 18px;
        // width: 100% !important;

        > * {
            opacity: 0;
        }

        &.show-toolbar {
            > * {
                opacity: 1;
            }
        }

        .cellcommand {
            display: inline-block;
            cursor: pointer;
            font-size: 11px;
            color: rgba(0, 0, 0, 0.6);
            margin-top: 7px;
            position: relative;
            z-index: 10000000;
            &:not(:last-child) {
                /* border-right: 1px solid #42a5f5; */
            }
            .icon-cellcommand {
                webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                width: 1em;
                height: 1em;
                display: inline-block;
                fill: currentColor;
                -webkit-flex-shrink: 0;
                -ms-flex-negative: 0;
                flex-shrink: 0;
                -webkit-transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                font-size: 1rem;
            }
            .tooltiptext {
                visibility: hidden;
                font-size: 11px;
                background-color: #727171;
                color: #fff;
                text-align: center;
                border-radius: 6px;
                padding: 2px 4px;
                min-width: 65px;
                position: absolute;
                z-index: 1;
                bottom: -80%;
                left: 100%;
                margin-left: -5px;
                opacity: 1;
                transition: opacity 0.3s;
                &::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -5px;
                    border-width: 5px;
                    border-style: solid;
                    /* border-color: #555 transparent transparent transparent; */
                }
            }
            &:hover {
                .tooltiptext {
                    visibility: visible;
                }
                /* color: #8a8989; */
                svg {
                    background-color: #f3f3f3;
                }
            }
        }
    }

    .cellfirstline {
        border-top: 1px dashed rgb(153, 179, 171, 0.6);
        margin-top: -5px;
        // background-color: white; //rgb(218, 255, 237, 0.3);
        &.active {
            border-top: 1px solid rgb(153, 179, 171, 1);
            // background-color: rgb(218, 255, 237, 0.6);
        }
    }

    .celllastline {
        border-top: 1px dashed rgb(153, 179, 171, 0.6);
        margin-top: 5px;
        :first-of-type {
            border-top: none;
        }
        &.active {
            // if this is the active cell, we have to activate the next widget
            & + .cellwidget {
                border-top: 1px solid rgb(153, 179, 171, 1);
                // background-color: rgb(218, 255, 237, 0.6);
            }
        }
    }
`;
