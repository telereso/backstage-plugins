import React, {useState} from 'react';
import {Button} from "@material-ui/core";

interface Props {
    text: string;
}

const LocationComponent: React.FC<Props> = ({text}) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000); // Reset copied state after 2 seconds
    };

    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            <span style={{color: 'gray', marginRight: '5px'}}>{`Location: ${text}`}</span>
            <Button onClick={copyToClipboard} disabled={copied}>
                Copy
            </Button>
            <span style={{marginLeft: '5px', color: copied ? 'green' : 'transparent'}}>Copied!</span>
        </div>
    );
};

export default LocationComponent;
