"use client";
function CustomInput({
    title = "Company",
    placeholder = "Company",
    value = "",
    setValue = () => {}
}){
    return (
        <>
            <label className="mb-1 mt-3 text-sm">{title}</label>
            <input 
                placeholder={placeholder}
                value={value}
                className="appearance-none border rounded py-2 px-[8px] text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                onChange={(e) => setValue(e.target.value)}
            />
        </>
    );
}

export {CustomInput};