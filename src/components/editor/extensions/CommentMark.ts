import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        commentMark: {
            setComment: (commentId: string) => ReturnType
            unsetComment: (commentId: string) => ReturnType
        }
    }
}

export const CommentMark = Mark.create({
    name: 'commentMark',

    inclusive: false,

    addAttributes() {
        return {
            commentId: {
                default: null,
                parseHTML: (el) => el.getAttribute('data-comment-id'),
                renderHTML: (attrs) => {
                    if (!attrs.commentId) return {}
                    return { 'data-comment-id': attrs.commentId }
                },
            },
        }
    },

    parseHTML() {
        return [{ tag: 'span[data-comment-id]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, { class: 'comment-highlight' }),
            0,
        ]
    },

    addCommands() {
        return {
            setComment:
                (commentId: string) =>
                ({ commands }) => {
                    return commands.setMark(this.name, { commentId })
                },
            unsetComment:
                (commentId: string) =>
                ({ tr, state }) => {
                    const { doc } = state
                    doc.descendants((node, pos) => {
                        node.marks.forEach((mark) => {
                            if (
                                mark.type.name === this.name &&
                                mark.attrs.commentId === commentId
                            ) {
                                tr.removeMark(pos, pos + node.nodeSize, mark)
                            }
                        })
                    })
                    return true
                },
        }
    },
})
