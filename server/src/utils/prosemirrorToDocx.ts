import {
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  type ParagraphChild,
} from "docx";

interface PMNode {
  type: string;
  attrs?: Record<string, any>;
  content?: PMNode[];
  text?: string;
  marks?: { type: string }[];
}

const HEADING_LEVELS: Record<
  number,
  (typeof HeadingLevel)[keyof typeof HeadingLevel]
> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
};

function textRunFromNode(node: PMNode): TextRun {
  const marks = new Set((node.marks ?? []).map((m) => m.type));

  return new TextRun({
    text: node.text ?? "",
    bold: marks.has("bold"),
    italics: marks.has("italic"),
    strike: marks.has("strike"),
    ...(marks.has("code") ? { font: "Courier New" } : {}),
  });
}

function inlineChildren(node: PMNode): ParagraphChild[] {
  if (!node.content) {
    return [];
  }

  return node.content.flatMap((child) =>
    child.type === "text" ? [textRunFromNode(child)] : [],
  );
}

export function proseMirrorJsonToDocxChildren(root: PMNode): Paragraph[] {
  const out: Paragraph[] = [];

  function walk(node: PMNode, listDepth = 0, ordered = false) {
    switch (node.type) {
      case "doc": {
        node.content?.forEach((c) => walk(c));

        break;
      }

      case "paragraph": {
        out.push(new Paragraph({ children: inlineChildren(node) }));

        break;
      }

      case "heading": {
        const level =
          HEADING_LEVELS[node.attrs?.level ?? 1] ?? HeadingLevel.HEADING_1;

        out.push(
          new Paragraph({ heading: level, children: inlineChildren(node) }),
        );

        break;
      }

      case "blockquote": {
        node.content?.forEach((c) => {
          if (c.type === "paragraph") {
            const children: TextRun[] =
              c.content
                ?.filter((child) => child.type === "text")
                .map(
                  (child) =>
                    new TextRun({
                      text: child.text ?? "",
                      italics: true,
                      color: "505050",
                    }),
                ) ?? [];

            out.push(
              new Paragraph({
                indent: { left: 400 },
                spacing: { before: 100, after: 100 },
                border: {
                  left: {
                    style: BorderStyle.SINGLE,
                    size: 12,
                    color: "37352F",
                    space: 8,
                  },
                },
                children,
              }),
            );
          } else {
            walk(c, listDepth, ordered);
          }
        });

        break;
      }

      case "codeBlock": {
        const text = node.content?.map((c) => c.text ?? "").join("") ?? "";

        out.push(
          new Paragraph({
            children: [new TextRun({ text, font: "Courier New" })],
            shading: { fill: "F4F4F5" },
          }),
        );

        break;
      }

      case "bulletList": {
        node.content?.forEach((li) => walk(li, listDepth + 1, false));

        break;
      }

      case "orderedList": {
        node.content?.forEach((li) => walk(li, listDepth + 1, true));

        break;
      }

      case "listItem": {
        node.content?.forEach((c) => {
          if (c.type === "paragraph") {
            out.push(
              new Paragraph({
                ...(!ordered ? { bullet: { level: listDepth - 1 } } : {}),
                ...(ordered
                  ? {
                      numbering: {
                        reference: "default-numbering",
                        level: listDepth - 1,
                      },
                    }
                  : {}),
                children: inlineChildren(c),
              }),
            );
          } else {
            walk(c, listDepth, ordered);
          }
        });

        break;
      }

      case "horizontalRule": {
        out.push(
          new Paragraph({ children: [new TextRun({ text: "——————————" })] }),
        );

        break;
      }

      default: {
        node.content?.forEach((c) => walk(c, listDepth, ordered));
      }
    }
  }

  walk(root);

  return out;
}
