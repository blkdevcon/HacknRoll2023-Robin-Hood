// @ts-nocheck
import _ from "lodash";

var threshold = 45;
var audience = "Knowledgeable",
    formality = "Neutral",
    positivity = "Neutral",
    intent,
    context;

// Get the wrapper element
function getWrapper() {
    return document.querySelectorAll('div[class="notion-page-content"]')[0];
}

// Function to scan for new elements
let scanDiv = (function () {
    var MutationObserver =
        window.MutationObserver || window.WebKitMutationObserver;
    return function (obj, callback) {
        if (!obj || obj.nodeType !== 1) return;
        if (MutationObserver) {
            var mutationObserver = new MutationObserver(callback);
            mutationObserver.observe(obj, {
                childList: true,
                subtree: false
            });
            return mutationObserver;
        } else if (window.addEventListener) {
            obj.addEventListener("DOMNodeInserted", callback, false);
            obj.addEventListener("DOMNodeRemoved", callback, false);
        }
    };
})();

// Get the text content from the scanDiv wrapper
let getTextContent = (function (): string {
    return function (el) {
        let block = el.querySelectorAll('div[class="notion-selectable"]')[0];

        // Only proceed if query success, otherwise return empty string
        if (block) {
            let blockInnerTextContent = block.querySelectorAll(
                'div[data-content-editable-leaf="true"]'
            )[0];
            if (blockContent) return blockInnerTextContent.innerText;
            else return "";
        } else return "";
    };
})();

// Function to append advisory
let addWarning = (function () {
    return async function (el: Element, score: number) {
        console.log(el);
        // Get the tweet from this element
        let blockInnerTextContent = el.querySelectorAll(
            'div[data-content-editable-leaf="true"]'
        )[0];

        blockInnerTextContent.style.color = "red";
        blockInnerTextContent.addEventListener("click", () => {
            generateNewContentAndReplace(blockInnerTextContent);
        });

        // blockInnerTextContent.style.position = "relative";
        // const modal = blockInnerTextContent.appendChild(
        //     document.createElement("div")
        // );
        // modal.innerHTML = `
        // <div className="Modal">
        //     <h1>Test</h1>
        // </div>
        // `;
        // console.log("#1", blockInnerTextContent.innerHTML);
        // blockInnerTextContent.innerHTML = "KEI LOK IS A BOT";
        // const resp = await fetch("http://localhost:5000/api/v1/analyze", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //         // 'Content-Type': 'application/x-www-form-urlencoded',
        //     },
        //     body: JSON.stringify({
        //         text: blockInnerTextContent.textContent
        //     })
        // });

        // console.log(resp);

        return;
    };
})();

async function generateNewContentAndReplace(currentNode) {
    console.log(currentNode);
    console.log("Ran generateNewContentAndReplace!");
    try {
        const resp = await fetch("http://localhost:8080/api/v1/completion", {
            method: 'POST',
            // mode: 'no-cors',
            headers: {
                'Accept': "application/json",
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                context: "general",
                audience: "general",
                intent: "general",
                formality: "neutral",
                role: "anyone",
                text: currentNode.textContent
            })
        });
        // const data = await resp.json();
        console.log(resp);
        if (resp.ok) {
            console.log(await resp.json());
        }
    } catch (error) {
        console.log(error)
    }

    // const resp = await new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         resolve(Math.floor(Math.random() * 50));
    //     }, 1000);
    // });

    // currentNode.innerHTML = resp.content;
    currentNode.style.color = "black";
}

async function getBlockTextContentRiskScore(blockText): number {
    // axios.post("http://localhost:5000/api/v1/analyze", {
    //     text: blockText
    // });

    // Return a random between 0 to 50
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(Math.floor(Math.random() * 50));
        }, 1000);
    });
}

// Function to call for each element of the homepage
let runScript = (function () {
    return async function (allNodes) {
        // Cast allNodes to an array
        allNodes = Array.from(allNodes);
        let promises = allNodes.map(async (node, i) => {
            // Reset score
            let score = 0;
            // Get block's text content for analysis
            let blockTextContent = getTextContent(node);
            // Make backend call to identify if content might be generated by a bot
            blockTextRiskScore = await getBlockTextContentRiskScore(
                blockTextContent
            );
            // Log score of content
            console.log(
                "Paragraph has a risk score eval of: " + blockTextRiskScore
            );

            if (blockTextRiskScore > threshold) {
                console.log("THIS IS BEING INVOKED! INDEED!");
                addWarning(node, score);
            }
            return blockTextRiskScore;
        });
        let allScores = await Promise.all(promises);
        return allScores;
    };
})();

function waitFor(
    varSetter: any,
    sleepTime: any,
    condition: any,
    continuation: any
) {
    let variable = varSetter();
    if (!condition(variable)) {
        setTimeout(
            () => waitFor(varSetter, sleepTime, condition, continuation),
            sleepTime
        );
    } else {
        continuation(variable);
    }
}

waitFor(
    getWrapper,
    1000,
    (wrapper) => wrapper !== undefined,
    function (wrapper) {
        console.log("Preliminary wrapper get succeeded");
        // First pass
        let blocks = wrapper.children;
        console.log("wrapper", wrapper.children);
        runScript(blocks);
        // Observe for changes of wrapper's child nodes
        (() => {
            scanDiv(wrapper, function (el) {
                var addedNodes = [],
                    removedNodes = [];

                // Record down added divs
                el.forEach((record) => {
                    record.addedNodes.length &
                        addedNodes.push(...record.addedNodes);
                });

                // Record down deleted divs
                el.forEach(
                    (record) =>
                        record.removedNodes.length &
                        removedNodes.push(...record.removedNodes)
                );

                // Run the script for added nodes
                runScript(addedNodes);

                console.log("Added:", addedNodes, "Removed:", removedNodes);
            });
        })();
    }
);
