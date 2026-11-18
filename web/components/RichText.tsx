import { Fragment, type ReactNode } from "react";

/** Inline: **bold** only — content is authored by us, not users. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

type Block =
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] };

function parse(body: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of body.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    let para: string[] = [];
    const flushPara = () => {
      if (para.length) blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    };
    for (const line of lines) {
      const ul = /^[-•]\s+(.*)$/.exec(line);
      const ol = /^\d+[.)]\s+(.*)$/.exec(line);
      const type = ul ? "ul" : ol ? "ol" : null;
      if (type) {
        flushPara();
        const last = blocks[blocks.length - 1];
        const item = (ul ?? ol)![1];
        if (last && last.type === type) last.items.push(item);
        else blocks.push({ type, items: [item] });
      } else {
        para.push(line);
      }
    }
    flushPara();
  }
  return blocks;
}

export function RichText({ text }: { text: string }) {
  return (
    <div className="rich-text">
      {parse(text).map((block, i) => {
        if (block.type === "p") return <p key={i}>{inline(block.text)}</p>;
        const List = block.type;
        return (
          <List key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{inline(item)}</li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
