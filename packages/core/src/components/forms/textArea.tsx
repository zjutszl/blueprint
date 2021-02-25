/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import classNames from "classnames";
import React from "react";

import {
    AbstractPureComponent2,
    Classes,
    getRef,
    IRef,
    IRefObject,
    isRefCallback,
    isRefObject,
    refHandler,
} from "../../common";
import { DISPLAYNAME_PREFIX, IIntentProps, IProps } from "../../common/props";

export interface ITextAreaProps extends IIntentProps, IProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /**
     * Whether the text area should take up the full width of its container.
     */
    fill?: boolean;

    /**
     * Whether the text area should appear with large styling.
     */
    large?: boolean;

    /**
     * Whether the text area should appear with small styling.
     */
    small?: boolean;

    /**
     * Whether the text area should automatically grow vertically to accomodate content.
     */
    growVertically?: boolean;

    /**
     * Ref handler that receives HTML `<textarea>` element backing this component.
     */
    inputRef?: IRef<HTMLTextAreaElement>;
}

export interface ITextAreaState {
    height?: number;
}

// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */

export class TextArea extends AbstractPureComponent2<ITextAreaProps, ITextAreaState> {
    public static displayName = `${DISPLAYNAME_PREFIX}.TextArea`;

    public state: ITextAreaState = {};

    // used to measure and set the height of the component on first mount
    public textareaElement: HTMLTextAreaElement | IRefObject<HTMLTextAreaElement> | null = null;

    private handleRef: IRef<HTMLTextAreaElement> = refHandler(this, "textareaElement", this.props.inputRef);

    public componentDidMount() {
        if (this.props.growVertically && this.textareaElement !== null) {
            // HACKHACK: this should probably be done in getSnapshotBeforeUpdate
            /* eslint-disable-next-line react/no-did-mount-set-state */
            this.setState({
                height: getRef(this.textareaElement)!.scrollHeight,
            });
        }
    }

    public componentDidUpdate(prevProps: ITextAreaProps) {
        const { inputRef } = this.props;
        if (prevProps.inputRef !== inputRef) {
            if (isRefObject<HTMLTextAreaElement>(inputRef)) {
                inputRef.current = (this.textareaElement as IRefObject<HTMLTextAreaElement>).current;
                this.textareaElement = inputRef;
            } else if (isRefCallback<HTMLTextAreaElement>(inputRef)) {
                inputRef(this.textareaElement as HTMLTextAreaElement | null);
            }
        }
    }

    public render() {
        const { className, fill, inputRef, intent, large, small, growVertically, ...htmlProps } = this.props;

        const rootClasses = classNames(
            Classes.INPUT,
            Classes.intentClass(intent),
            {
                [Classes.FILL]: fill,
                [Classes.LARGE]: large,
                [Classes.SMALL]: small,
            },
            className,
        );

        // add explicit height style while preserving user-supplied styles if they exist
        let { style = {} } = htmlProps;
        if (growVertically && this.state.height != null) {
            // this style object becomes non-extensible when mounted (at least in the enzyme renderer),
            // so we make a new one to add a property
            style = {
                ...style,
                height: `${this.state.height}px`,
            };
        }

        return (
            <textarea
                {...htmlProps}
                className={rootClasses}
                onChange={this.handleChange}
                ref={this.handleRef}
                style={style}
            />
        );
    }

    private handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (this.props.growVertically) {
            this.setState({
                height: e.target.scrollHeight,
            });
        }

        if (this.props.onChange != null) {
            this.props.onChange(e);
        }
    };
}
