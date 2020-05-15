import interact from 'interactjs';

/**
 * TODO
 *
 */
const setup = () => {
    interact('.resize-interactjs')
        .resizable({
            // resize from all edges and corners
            edges: { left: true, right: true, bottom: true, top: true },

            listeners: {
                move (event) {
                    var target = event.target
                    var x = (parseFloat(target.getAttribute('data-x')) || 0)
                    var y = (parseFloat(target.getAttribute('data-y')) || 0)

                    // update the element's style
                    target.style.width = event.rect.width + 'px'
                    target.style.height = event.rect.height + 'px'

                    // translate when resizing from top or left edges
                    x += event.deltaRect.left
                    y += event.deltaRect.top

                    target.style.webkitTransform = target.style.transform =
                        'translate(' + x + 'px,' + y + 'px)'

                    target.setAttribute('data-x', x)
                    target.setAttribute('data-y', y)
                    // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
                }
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent'
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: { width: 50, height: 50 }
                })
            ],

            // inertia: true
        });

    interact('.drag-interactjs')
        .draggable({
            listeners: {
                move (event) {
                    var target = event.target
                    // keep the dragged position in the data-x/data-y attributes
                    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
                    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

                    // translate the element
                    target.style.webkitTransform =
                        target.style.transform =
                            'translate(' + x + 'px, ' + y + 'px)'

                    // update the posiion attributes
                    target.setAttribute('data-x', x)
                    target.setAttribute('data-y', y)
                }
            },
            // inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ]
        });
};

export default setup;