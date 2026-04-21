import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
