import { useState } from 'react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
  }

  return (
    <button onClick={copyText}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default CopyButton;