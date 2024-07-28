"use client";
function Search({
    search = "",
    setSearch = () => {}
}){
    return (
        <form>
            <input placeholder="Type a keyword..."  value={search}
                className="border rounded text-gray-700 leading-tight focus:outline-none py-[12px] px-3 mt-3 mb-1 ms-[-20px]"
                onChange={(e) => {
                    setSearch(e.target.value.trimStart()    
                )}}
            />
        </form>
    );
}

export {Search};