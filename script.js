document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("box-form");
    const container = document.getElementById("container");

    let currentBox = null; // Track the currently selected box
    const placedBoxes = []; // To track the positions of all placed small boxes

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const bigBoxWidth = parseInt(document.getElementById("big-box-width").value, 10);
        const bigBoxHeight = parseInt(document.getElementById("big-box-height").value, 10);
        const smallBoxWidth = parseInt(document.getElementById("small-box-width").value, 10);
        const smallBoxHeight = parseInt(document.getElementById("small-box-height").value, 10);
        const numBoxes = parseInt(document.getElementById("num-small-boxes").value, 10);

        container.style.width = `${bigBoxWidth}px`;
        container.style.height = `${bigBoxHeight}px`;
        container.innerHTML = ""; // Clear existing boxes

        // Generate the boxes ensuring no overlap
        for (let i = 0; i < numBoxes; i++) {
            const box = document.createElement("div");
            box.className = "draggable";
            box.style.width = `${smallBoxWidth}px`;
            box.style.height = `${smallBoxHeight}px`;

            let position;
            do {
                const x = Math.random() * (bigBoxWidth - smallBoxWidth);
                const y = Math.random() * (bigBoxHeight - smallBoxHeight);
                position = { x, y };
            } while (isOverlapping(position, placedBoxes, smallBoxWidth, smallBoxHeight));

            box.style.left = `${position.x}px`;
            box.style.top = `${position.y}px`;

            placedBoxes.push({ ...position, width: smallBoxWidth, height: smallBoxHeight, element: box });

            const coordDisplay = document.createElement("span");
            coordDisplay.className = "coord-display";
            coordDisplay.style.display = "none";
            box.appendChild(coordDisplay);

            box.addEventListener("mousedown", () => {
                currentBox = box;
                updateCoordinates(currentBox);
                coordDisplay.style.display = "block";
            });

            container.appendChild(box);
        }

        // Add drag functionality
        container.addEventListener("mousemove", (event) => {
            if (currentBox) {
                const containerRect = container.getBoundingClientRect();
                const boxWidth = parseInt(currentBox.style.width, 10);
                const boxHeight = parseInt(currentBox.style.height, 10);

                let newX = event.clientX - containerRect.left - boxWidth / 2;
                let newY = event.clientY - containerRect.top - boxHeight / 2;

                // Boundary check
                newX = Math.max(0, Math.min(newX, container.offsetWidth - boxWidth));
                newY = Math.max(0, Math.min(newY, container.offsetHeight - boxHeight));

                // Check for collision with other boxes
                if (!isColliding({ x: newX, y: newY }, placedBoxes, boxWidth, boxHeight, currentBox)) {
                    currentBox.style.left = `${newX}px`;
                    currentBox.style.top = `${newY}px`;
                    updateCoordinates(currentBox);
                }
            }
        });

        // Stop dragging
        container.addEventListener("mouseup", () => {
            if (currentBox) {
                const coordDisplay = currentBox.querySelector(".coord-display");
                coordDisplay.style.display = "none";
                currentBox = null;
            }
        });

        // Stop dragging when mouse leaves container
        container.addEventListener("mouseleave", () => {
            if (currentBox) {
                const coordDisplay = currentBox.querySelector(".coord-display");
                coordDisplay.style.display = "none";
                currentBox = null;
            }
        });

        function updateCoordinates(box) {
            const boxRect = box.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const x = Math.round(boxRect.left - containerRect.left);
            const y = Math.round(boxRect.top - containerRect.top);

            const coordDisplay = box.querySelector(".coord-display");
            coordDisplay.textContent = `(${x}, ${y})`;
        }

        // Check if a box is overlapping with any placed box
        function isOverlapping(pos, boxes, width, height) {
            return boxes.some(box => {
                return (
                    pos.x < box.x + box.width &&
                    pos.x + width > box.x &&
                    pos.y < box.y + box.height &&
                    pos.y + height > box.y
                );
            });
        }

        // Check if a box is colliding with any other box during drag
        function isColliding(pos, boxes, width, height, currentBox) {
            return boxes.some(box => {
                if (box.element === currentBox) return false; // Ignore self
                return (
                    pos.x < box.x + box.width &&
                    pos.x + width > box.x &&
                    pos.y < box.y + box.height &&
                    pos.y + height > box.y
                );
            });
        }
    });
});
