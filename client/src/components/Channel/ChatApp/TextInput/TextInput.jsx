import React, {useState} from 'react'

const TextInput = () => {
    const [text, setText] = useState('');
    return (
        <div>
            <input 
                type="text" 
                name="text" 
                id="text" 
                value={text}
                onChange={(event)=>{
                    setText(event.target.value);
                }}
                />
        </div>
    )
}

export default TextInput
