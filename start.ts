import SoundCloud from "./soundcloud"
import * as fs from 'fs';
require("dotenv").config()
const soundcloud = new SoundCloud(process.env.SOUNDCLOUD_CLIENT_ID, process.env.SOUNDCLOUD_OAUTH_TOKEN);
(async () => {
    //const result = await soundcloud.util.downloadTrack("https://soundcloud.com/euphonicsessions/euphonic-sessions-january2024", "./tracks")
    const limitedFollowers = await soundcloud.users.followersV2('jamesanjunadeep');
    fs.writeFileSync('./test.json',JSON.stringify(limitedFollowers));
})()