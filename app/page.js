'use client'
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Rating from '@mui/material/Rating';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));



export default function Home() {
  const [messages, setMessages] = useState([
    {
      role:'Obi',
      content:'Hello There. I am Obi, your go to for finding what you need to know about any professor.'
    }
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [aImage, setImage] = useState("/user.png");

  const sendMessage = async() =>{
    setIsLoading(true)
    setMessages((messages) => [
      ...messages,
      {role:'user', content: message},
      {role:'Obi', content:''}
    ])
    const response = fetch('api/chat',{
      method:'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role:'user', content: message}])
    }).then(async(res)=>{
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      let result = ''
      return reader.read().then(function processText({done, value}){
        if(done){
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), {stream: true})
        setMessages((messages) =>{
          let lastm = messages[messages.length-1]
          let om = messages.slice(0, messages.length-2)
          return [
            ...om,
            {...lastm, content: lastm.content = text},
          ]
        })
        result += text;
        return reader.read().then(processText)
      })
      })
    setMessage('')
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bgcolor='#0B0C10'>
      <Stack direction="column" width="500px" height="700px" border="1px" p={2} spacing={3} sx={{ borderRadius: '16px', borderColor: '#66FCF1' }}>
        <Stack direction="row" width="467px" height="70px" bgcolor="#45A29E" spacing={1} alignItems="center" padding={2} sx={{ borderRadius: '16px' }}>
          <Box width="50px" height="46px">
            <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot">
              <Avatar src="/modelavatar.jpg" />
            </StyledBadge>
          </Box>
          <Typography color='#0b0c10' variant='h5'>Obi, The RateMyProfessor Expert</Typography>
        </Stack>
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
          {messages.map((msg, index) => (
            <Box key={index} display="flex" justifyContent={msg.role === 'Obi' ? 'flex-start' : 'flex-end'}>
              <Stack direction={msg.role === 'Obi' ? 'row' : 'row-reverse'}>
                <Avatar src={msg.role === 'Obi' ? '/modelavatar.jpg' : aImage} />
                <Box bgcolor={msg.role === 'Obi' ? '#9ef7f1' : '#C5C6C7'} color="#1F2833" borderRadius={1} p={3}>
                  <Markdown>{msg.content}</Markdown>
                </Box>
              </Stack>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            placeholder='Say "Hello" to begin chatting!'
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiInputBase-input': { color: '#C5C6C7' },
              '& .MuiInputLabel-root': { color: '#C5C6C7' },
              '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#C5C6C7' },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00d1c4' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#00d1c4' }
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{ bgcolor: '#00635d', color: '#C5C6C7', '&:hover': { backgroundColor: '#00d1c4' } }}
          >
            <SendIcon />
          </Button>
        </Stack>
        {/*{!session ? (
          <Button
            onClick={() => signIn('google')}
            startIcon={<GoogleIcon />}
            variant="contained"
            sx={{ color: '#0B0C10', backgroundColor: '#C5C6C7', '&:hover': { backgroundColor: '#00d1c4' } }}
          >
            Sign In With Google
          </Button>
        ) : (
          <Button
            onClick={() => signOut()}
            variant="contained"
            sx={{ color: '#C5C6C7', backgroundColor: '#00635d', '&:hover': { backgroundColor: '#00d1c4' } }}
          >
            Sign Out
          </Button>
        )}*/}
      </Stack>
    </Box>
  );
}
