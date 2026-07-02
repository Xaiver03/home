import config from "../../config.js"
import { get_song_url } from "./song.js"
import { changeUrlQuery } from "./util.js"

const get_playlist = async (id, cookie = '') => {
    const data = {
        id: id,
        format: 'json',
        inCharset: 'utf-8',
        outCharset: 'utf-8',
        platform: 'yqq',
        newsong: 1,
        needNewCode: 0,
    }


    const headers = {
        Referer: `https://y.qq.com/n/ryqq/playlist/${id}`,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/91.0.4472.120 Mobile Safari/537.36',
    }

    const url = changeUrlQuery(data, 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_playlist_cp.fcg')

    let result = await fetch(url, { headers });

    result = await result.json()
    result = result.data.cdlist[0].songlist

    let jsonp
    if (config.OVERSEAS) {
        const ids = result.map(song => song.songmid)
        jsonp = await get_song_url(ids.join(','))
    }
    const res = await Promise.all(result.map(async song => {
        const songmid = song.mid || song.songmid
        const albummid = song.album?.mid || song.albummid
        let song_info = {
            author: song.singer.reduce((i, v) => ((i ? i + " / " : i) + (v.name || v.title)), ''),
            title: song.title || song.songname,
            pic: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albummid}.jpg`,
            url: config.OVERSEAS ? '' : songmid,
            lrc: songmid,
            songmid: songmid,
        }
        return song_info
    }));

    if (config.OVERSEAS) res[0].url = jsonp
    return res;
}


// const res = await get_playlist('7326220405')
// console.log(res)

export { get_playlist }
