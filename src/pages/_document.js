import Document, { Html, Head, Main, NextScript } from 'next/document';
import { createGetInitialProps } from '@mantine/next';

const getInitialProps = createGetInitialProps();
export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <title>Hackfest 2023 - QnA</title>
        <meta property="og:image" content="/og.png" />
        <meta property="og:title" content="Hackfest 2023 - QnA" />
        <meta property="og:description" content="Ask questions for the Intro to NextJS Workshop" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Hackfest 2023 - QnA" />
        <meta name="twitter:card" content="/og.png" />

        <Head />

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
