// data types for @codemirror selection node_modules/@codemirror/state/dist/index.d.ts
// stripped of methods clone to avoid heavy dependency

/** @codemirror/state
This type describes a line in the document. It is created
on-demand when lines are [queried](https://codemirror.net/6/docs/ref/#state.Text.lineAt).
*/
export interface Line {
    /**
    The position of the start of the line.
    */
    readonly from: number;
    /**
    The position at the end of the line (_before_ the line break,
    or at the end of document for the last line).
    */
    readonly to: number;
    /**
    This line's line number (1-based).
    */
    readonly number: number;
    /**
    The line's content.
    */
    readonly text: string;
}

/** @codemirror/state
A single selection range. When
[`allowMultipleSelections`](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
is enabled, a [selection](https://codemirror.net/6/docs/ref/#state.EditorSelection) may hold
multiple ranges. By default, selections hold exactly one range.
*/
export interface SelectionRange {
    /**
    The lower boundary of the range.
    */
    readonly from: number;
    /**
    The upper boundary of the range.
    */
    readonly to: number;
}

/** @codemirror/state
 * An editor selection holds one or more selection ranges.
 */
export interface EditorSelection {
    /**
    The ranges in the selection, sorted by position. Ranges cannot
    overlap (but they may touch, if they aren't empty).
    */
    readonly ranges: readonly SelectionRange[];
}

/** @codemirror/state
 * editor selection
 */
export interface Statistics {
    /** total length of the document */
    length: number;
    /** Get the number of lines in the editor. */
    lineCount: number;
    /** Get the currently line description around the given position. */
    line: Line;
    /** Get the proper [line-break](https://codemirror.net/docs/ref/#state.EditorState^lineSeparator) string for this state. */
    lineBreak: string;
    /** Returns true when the editor is [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only. */
    readOnly: boolean;
    /** The size (in columns) of a tab in the document, determined by the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet. */
    tabSize: number;
    /** Cursor Position */
    selection: EditorSelection;
    /** Make sure the selection only has one range. */
    selectionAsSingle: SelectionRange;
    /** Retrieves a list of all current selections. */
    ranges: readonly SelectionRange[];
    /** Get the currently selected code. */
    selectionCode: string;
    /**
     * The length of the given array should be the same as the number of active selections.
     * Replaces the content of the selections with the strings in the array.
     */
    selections: string[];
    /** Return true if any text is selected. */
    selectedText: boolean;
}
