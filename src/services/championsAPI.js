async function getTftData(){
        
    let res = await fetch('https://raw.communitydragon.org/13.6/cdragon/tft/en_us.json');
    if(res.status != 200) {
        throw new Error("Something went wrong!");
    }
    return res.json();
}

export { getTftData }