import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'amZ1aexhad61DWAa1ZWvqXct6j7bya2s',
    socket: {
        host: 'redis-18091.c91.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18091
    }
});

client.on('error', err => console.log('Redis Client Error', err));

if(!client.isOpen){
    client.connect();

}

// async function getData(params) {
    

//     await client.connect();
    
//     await client.get('age');
//     const result = await client.get('foo');
//     console.log(result)  // >>> bar

// }

export {client}


