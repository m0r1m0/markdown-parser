import parse from "..";
import { Block } from "../types";

test("empty", () => {
  expect(parse("")).toEqual([]);
});

describe("Paragraphs", () => {
  test("A simple example with two paragraphs", () => {
    const text = "aaa\n\nbbb";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "aaa",
      },
      {
        type: "paragraph",
        text: "bbb",
      },
    ];
    const r = parse(text);
    expect(r).toEqual(block);
  });
  test("Paragraphs can contain multiple lines, but no blank lines", () => {
    const text = "aaa\nbbb\n\nccc\nddd";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "aaa\nbbb",
      },
      {
        type: "paragraph",
        text: "ccc\nddd",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Multiple blank lines between paragraph have no effect", () => {
    const text = "aaa\n\n\nbbb";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "aaa",
      },
      {
        type: "paragraph",
        text: "bbb",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Leading spaces are skipped", () => {
    const text = "  aaa\n bbb";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "aaa\nbbb",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Lines after the first may be indented any amount, since indented code blocks cannot interrupt paragraphs", () => {
    const text =
      "aaa\n             bbb\n                                       ccc";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "aaa\nbbb\nccc",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
});

describe("Thematic breaks", () => {
  test("basic", () => {
    const text = "***\n---\n___";
    const block: Block[] = [
      {
        type: "thematic-break",
      },
      {
        type: "thematic-break",
      },
      {
        type: "thematic-break",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Wrong characters", () => {
    const text = "+++";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "+++",
      },
    ];
    expect(parse(text)).toEqual(block);
    const text2 = "===";
    const block2: Block[] = [{ type: "paragraph", text: "===" }];
    expect(parse(text2)).toEqual(block2);
  });
  test("Not enough characters", () => {
    const text = "--\n**\n__";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "--\n**\n__",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("One to three spaces indent are allowed", () => {
    const text = " ***\n  ***\n   ***";
    const block: Block[] = [
      {
        type: "thematic-break",
      },
      {
        type: "thematic-break",
      },
      {
        type: "thematic-break",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Four spaces is too many", () => {
    const text = "Foo\n    ***";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "Foo\n***",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("More than three characters may be used", () => {
    const text = "_____________________________________";
    const block: Block[] = [
      {
        type: "thematic-break",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Spaces are allowed between the characters", () => {
    const text = " - - -";
    const block: Block[] = [
      {
        type: "thematic-break",
      },
    ];
    expect(parse(text)).toEqual(block);
    const text2 = " **  * ** * ** * **";
    const block2: Block[] = [
      {
        type: "thematic-break",
      },
    ];
    expect(parse(text2)).toEqual(block2);
    const text3 = "-     -      -      -";
    const block3: Block[] = [
      {
        type: "thematic-break",
      },
    ];
    expect(parse(text3)).toEqual(block3);
  });
  test("Spaces are allowed at the end", () => {
    const text = "- - - -    ";
    const block: Block[] = [{ type: "thematic-break" }];
    expect(parse(text)).toEqual(block);
  });
  test("No other characters may occur in the line", () => {
    const text = "_ _ _ _ a\n\na------\n\n---a---";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "_ _ _ _ a",
      },
      {
        type: "paragraph",
        text: "a------",
      },
      {
        type: "paragraph",
        text: "---a---",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Thematic breaks can interrupt a paragraph", () => {
    const text = "Foo\n***\nbar";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "Foo",
      },
      {
        type: "thematic-break",
      },
      {
        type: "paragraph",
        text: "bar",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
});

describe("ATX headings", () => {
  test("Simple headings", () => {
    const text = "# foo\n## foo\n### foo\n#### foo\n##### foo\n###### foo";
    const block: Block[] = [
      {
        type: "heading",
        level: 1,
        text: "foo",
      },
      {
        type: "heading",
        level: 2,
        text: "foo",
      },
      {
        type: "heading",
        level: 3,
        text: "foo",
      },
      {
        type: "heading",
        level: 4,
        text: "foo",
      },
      {
        type: "heading",
        level: 5,
        text: "foo",
      },
      {
        type: "heading",
        level: 6,
        text: "foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("More than six `#` characters is not a heading", () => {
    const text = "####### foo";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "####### foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("At least one space is required between the `#` characters and the heading’s contents, unless the heading is empty", () => {
    const text = "#5 bolt\n\n#hashtag\n\n#";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "#5 bolt",
      },
      {
        type: "paragraph",
        text: "#hashtag",
      },
      {
        type: "heading",
        level: 1,
        text: "",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Leading and trailing whitespace is ignored in parsing inline content", () => {
    const text = "#                  foo                     ";
    const block: Block[] = [
      {
        type: "heading",
        level: 1,
        text: "foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("One to three spaces indentation are allowed", () => {
    const text = " ### foo\n  ## foo\n   # foo";
    const block: Block[] = [
      {
        type: "heading",
        level: 3,
        text: "foo",
      },
      {
        type: "heading",
        level: 2,
        text: "foo",
      },
      {
        type: "heading",
        level: 1,
        text: "foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Four spaces are too much", () => {
    const text = "foo\n    # bar";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "foo\n# bar",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("A closing sequence of `#` characters is optional:", () => {
    const text = "## foo ##\n  ###   bar   ###";
    const block: Block[] = [
      {
        type: "heading",
        level: 2,
        text: "foo",
      },
      {
        type: "heading",
        level: 3,
        text: "bar",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("A closing sequence of `#` characters need not be the same length as the opening sequence", () => {
    const text = "# foo ##################################\n##### foo ##";
    const block: Block[] = [
      {
        type: "heading",
        level: 1,
        text: "foo",
      },
      {
        type: "heading",
        level: 5,
        text: "foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Spaces are allowed after the closing sequence", () => {
    const text = "### foo ###     ";
    const block: Block[] = [
      {
        type: "heading",
        level: 3,
        text: "foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("A sequence of `#` characters with anything but spaces following it is not a closing sequence, but counts as part of the contents of the heading", () => {
    const text = "### foo ### b";
    const block: Block[] = [
      {
        type: "heading",
        level: 3,
        text: "foo ### b",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("The closing sequence must be preceded by a space", () => {
    const text = "# foo#";
    const block: Block[] = [
      {
        type: "heading",
        level: 1,
        text: "foo#",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("ATX headings need not be separated from surrounding content by blank lines, and they can interrupt paragraphs", () => {
    const text = "****\n## foo\n****";
    const block: Block[] = [
      {
        type: "thematic-break",
      },
      {
        type: "heading",
        level: 2,
        text: "foo",
      },
      {
        type: "thematic-break",
      },
    ];
    expect(parse(text)).toEqual(block);

    const text2 = "Foo bar\n# baz\nBar foo";
    const block2: Block[] = [
      {
        type: "paragraph",
        text: "Foo bar",
      },
      {
        type: "heading",
        level: 1,
        text: "baz",
      },
      {
        type: "paragraph",
        text: "Bar foo",
      },
    ];
    expect(parse(text2)).toEqual(block2);
  });
  test("ATX headings can be empty", () => {
    const text = "## \n#\n### ###";
    const block: Block[] = [
      {
        type: "heading",
        level: 2,
        text: "",
      },
      {
        type: "heading",
        level: 1,
        text: "",
      },
      {
        type: "heading",
        level: 3,
        text: "",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
});

describe("Setext headings", () => {
  test("The underlining can be any length", () => {
    const text = "Foo\n-------------------------\n\nFoo\n=";
    const block: Block[] = [
      {
        type: "heading",
        level: 2,
        text: "Foo",
      },
      {
        type: "heading",
        level: 1,
        text: "Foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("The heading content can be indented up to three spaces, and need not line up with the underlining", () => {
    const text = "  Foo\n---\n\n  Foo\n-----\n\n Foo\n  ===";
    const block: Block[] = [
      {
        type: "heading",
        level: 2,
        text: "Foo",
      },
      {
        type: "heading",
        level: 2,
        text: "Foo",
      },
      {
        type: "heading",
        level: 1,
        text: "Foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("The setext heading underline can be indented up to three spaces, and may have trailing spaces", () => {
    const text = "Foo\n   ----      ";
    const block: Block[] = [
      {
        type: "heading",
        level: 2,
        text: "Foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Four spaces is too much", () => {
    const text = "Foo\n    ---";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "Foo\n---",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("The setext heading underline cannot contain internal spaces", () => {
    const text = "Foo\n= =\n\nFoo\n--- -";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "Foo\n= =",
      },
      {
        type: "paragraph",
        text: "Foo",
      },
      {
        type: "thematic-break",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Trailing spaces in the content line do not cause a line break", () => {
    const text = "Foo  \n-----";
    const block: Block[] = [
      {
        type: "heading",
        level: 2,
        text: "Foo",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("A blank line is needed between a paragraph and a following setext heading, since otherwise the paragraph becomes part of the heading’s content", () => {
    const text = "Foo\nBar\n---";
    const block: Block[] = [
      {
        type: "heading",
        level: 2,
        text: "Foo\nBar",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("A blank line is not required before or after setext headings", () => {
    const text = "---\nFoo\n---\nBar\n---\nBaz";
    const block: Block[] = [
      {
        type: "thematic-break",
      },
      {
        type: "heading",
        level: 2,
        text: "Foo",
      },
      {
        type: "heading",
        level: 2,
        text: "Bar",
      },
      {
        type: "paragraph",
        text: "Baz",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Setext headings cannot be empty", () => {
    const text = "\n====";
    const block: Block[] = [
      {
        type: "paragraph",
        text: "====",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
  test("Setext heading text lines must not be interpretable as block constructs other than paragraphs", () => {
    const text = "---\n---";
    const block: Block[] = [
      {
        type: "thematic-break",
      },
      {
        type: "thematic-break",
      },
    ];
    expect(parse(text)).toEqual(block);
  });
});
