
import { Box, Stack} from '@mui/material'

const item=['onion','tomato', 'apple','banana']
export default function Home() {
  // We'll add our component logic here
   return(
    <Box
      width="100vw"
      height="100vw"
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}

    >
      <Stack width="800px" height="600px" spacing={2}>
        {
          item.map((i)=>{
            <box
              key={i}
              width="100%"
              height="100px"
              display={'flex'} 
              justifyContent={'center'}
              alignItems={'center'}
              bgcolor={'#0f0f0f0'} 
            >{i}</box>
          })
        }
      </Stack>
      
    </Box>
   )
  
}

