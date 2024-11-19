document.getElementById('generate-boxes').addEventListener('click', function () {
    const container = document.getElementById('container');
    const bigBoxWidth = parseInt(document.getElementById('big-box-width').value);
    const bigBoxHeight = parseInt(document.getElementById('big-box-height').value);
    const smallBoxWidth = parseInt(document.getElementById('small-box-width').value);
    const smallBoxHeight = parseInt(document.getElementById('small-box-height').value);
    const numSmallBoxes = parseInt(document.getElementById('num-small-boxes').value);

    if (
        isNaN(bigBoxWidth) || isNaN(bigBoxHeight) ||
        isNaN(smallBoxWidth) || isNaN(smallBoxHeight) ||
        isNaN(numSmallBoxes) ||
        bigBoxWidth < smallBoxWidth || bigBoxHeight < smallBoxHeight
    ) {
        alert('Please enter valid dimensions and number of small boxes.');
        return;
    }

    // Check if the boxes can fit
    const boxesPerRow = Math.floor(bigBoxWidth / smallBoxWidth);
    const boxesPerColumn = Math.floor(bigBoxHeight / smallBoxHeight);
    const maxBoxes = boxesPerRow * boxesPerColumn;

    if (numSmallBoxes > maxBoxes) {
        alert(`Cannot fit ${numSmallBoxes} small boxes in the big box. Maximum possible: ${maxBoxes}`);
        return;
    }

    // Clear previous boxes
    container.innerHTML = '';
    container.style.width = bigBoxWidth + 'px';
    container.style.height = bigBoxHeight + 'px';

    // Generate and arrange small boxes
    let boxIndex = 0;
    for (let row = 0; row < boxesPerColumn; row++) {
        for (let col = 0; col < boxesPerRow; col++) {
            if (boxIndex >= numSmallBoxes) break;

            // Create a small box
            const smallBox = document.createElement('div');
            smallBox.className = 'draggable';
            smallBox.style.width = smallBoxWidth + 'px';
            smallBox.style.height = smallBoxHeight + 'px';
            smallBox.style.left = col * smallBoxWidth + 'px';
            smallBox.style.top = row * smallBoxHeight + 'px';

            // Enable dragging with collision detection
            enableDraggingWithCollision(smallBox, bigBoxWidth, bigBoxHeight, smallBoxWidth, smallBoxHeight);

            container.appendChild(smallBox);
            boxIndex++;
        }
    }
});

function enableDraggingWithCollision(element, bigBoxWidth, bigBoxHeight, smallBoxWidth, smallBoxHeight) {
    let offsetX, offsetY;

    const coordinatesDisplay = document.getElementById('coordinates');

    element.addEventListener('mousedown', (e) => {
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        element.style.cursor = 'grabbing';

        function move(e) {
            const containerRect = element.parentElement.getBoundingClientRect();
            const otherBoxes = Array.from(document.querySelectorAll('.draggable')).filter(box => box !== element);

            // Restrict movement within the big box
            let left = e.clientX - containerRect.left - offsetX;
            let top = e.clientY - containerRect.top - offsetY;

            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (left + smallBoxWidth > bigBoxWidth) {
                left = bigBoxWidth - smallBoxWidth;
            }
            if (top + smallBoxHeight > bigBoxHeight) {
                top = bigBoxHeight - smallBoxHeight;
            }

            // Check for collisions
            const collision = otherBoxes.some(box => {
                const boxRect = box.getBoundingClientRect();
                const newLeft = containerRect.left + left;
                const newTop = containerRect.top + top;

                return !(
                    newLeft + smallBoxWidth <= boxRect.left || // Right edge does not overlap
                    newLeft >= boxRect.right || // Left edge does not overlap
                    newTop + smallBoxHeight <= boxRect.top || // Bottom edge does not overlap
                    newTop >= boxRect.bottom // Top edge does not overlap
                );
            });

            if (!collision) {
                element.style.left = left + 'px';
                element.style.top = top + 'px';

                // Update coordinates
                const x = left + smallBoxWidth / 2;
                const y = bigBoxHeight - (top + smallBoxHeight / 2);
                coordinatesDisplay.textContent = `Coordinates: (x: ${x.toFixed(1)}, y: ${y.toFixed(1)})`;
            }
        }

        function stopMove() {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', stopMove);
            element.style.cursor = 'grab';
        }

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stopMove);
    });
}
