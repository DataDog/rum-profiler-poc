export function getNodePath(node: Node): string[] {
  const path: string[] = [];
  let current: Node | null = node;
  while (current) {
    const nodeName = getNodeName(current);
    const componentName = getComponentName(current);
    console.log(componentName);

    path.push(componentName ? nodeName + ` (${componentName})` : nodeName);
    current = current.parentNode;
  }
  return path;
}

function getNodeName(node: Node): string {
  if (node instanceof Element) {
    if (node.id) {
      return node.id;
    } else {
      return node.tagName.toLowerCase();
    }
  } else if (node instanceof Text) {
    return "text";
  } else if (node instanceof DocumentFragment) {
    return "fragment";
  } else if (node instanceof Document) {
    return "document";
  }

  return "unknown";
}

function getComponentName(node: Node, traverseUp = 0) {
  const key = Object.keys(node).find((key) => {
    return (
      key.startsWith("__reactFiber$") || // react 17+
      key.startsWith("__reactInternalInstance$")
    ); // react <17
  });
  if (!key) {
    return undefined;
  }

  const domFiber: any = node[key as keyof Node];
  if (domFiber == null) {
    return null;
  }

  // react <16
  if (domFiber._currentElement) {
    let compFiber = domFiber._currentElement._owner;
    for (let i = 0; i < traverseUp; i++) {
      compFiber = compFiber._currentElement._owner;
    }
    return compFiber._instance;
  }

  // react 16+
  const getFiber = (fiber: any) => {
    //return fiber._debugOwner; // this also works, but is __DEV__ only
    let parentFiber = fiber.return;
    while (typeof parentFiber.type == "string") {
      parentFiber = parentFiber.return;
    }
    return parentFiber;
  };
  let compFiber = getFiber(domFiber);
  for (let i = 0; i < traverseUp; i++) {
    compFiber = getFiber(compFiber);
  }

  return compFiber.stateNode;
}
