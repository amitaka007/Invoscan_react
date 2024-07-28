'use client';
import { AddComapny, AddUsers, CompaniesDelete, CompaniesList, addCompany, deleteCompany, usersList } from "@/api/user";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Modal from "react-responsive-modal";
import { toast } from 'react-toastify';
import ConfirmDeleteModal from "../../adminComponents/ConfirmDeleteModal";
import { CustomInput } from "../../adminComponents/CustomInput";
import { FilteredDataTable } from "@/components/FilteredDataTable";

const Users = ()=>{
    const [data,setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [open, setOpen] = useState(false);
    const [openAddUser, setUserOpen] = useState(false);
    const [openAddCompany, setCompanyOpen] = useState(false);
    const [userId,setUserId] = useState(null);
    const [companyList, setCompanyList] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [emailError, setEmailError] = useState(true);

    // company
    const [company,setCompany] = useState({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        user: "",
        invoiceMonthlyLimit: ""
    });

    // users
    const [value, setValue] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    });

    let userTableColumns = ["email", "firstName", "lastName", "role", "address"];
    let columns = [
        {
            name: 'Email',
            selector: row => row.email ? row.email : 'NA',
        },
        {
            name: 'First Name',
            selector: row => row.firstName ? row.firstName : 'NA',
        },
        {
            name: 'Last Name',
            selector: row => row.lastName ? row.lastName : 'NA',
        },
        {
            name: 'Role',
            selector: row => row.role ? row.role : 'NA',
        },
        {
            name: 'Address',
            selector: row => row.address ? row.address : 'NA',
        },
        {
            name: 'Companies',
            cell: row =>{
                   return <button className="bg-[#ededed] text-[#09ba96] px-4 py-2 rounded-lg" onClick={()=>{
                    setOpen(true)
                    setUserId(row.id)
                }}>Companies</button>
            }
        },
    ]
    let customStyles = {
        headRow: {
            style: {
                border: 'none',
            },
        },
        headCells: {
            style: {
                color: '#202124',
                fontSize: '14px',
            },
        },
        rows: {
            highlightOnHoverStyle: {
                backgroundColor: 'rgb(230, 244, 244)',
                borderBottomColor: '#FFFFFF',
                borderRadius: '25px',
                outline: '1px solid #FFFFFF',
            },
        },
        pagination: {
            style: {
                border: 'none',
            },
        },
    };

    useEffect(() => {
        if(selectedCompany){
            setShowDeleteModal(!showDeleteModal);
        }
    }, [selectedCompany])

    const fetchData = async () => {
        setLoading(true)
        try{
            const response = await usersList();
            const data = response.data.data;
            if (data && data) {
               setData(data);
               setTotalRows(data.length);
               setLoading(false);
            }else {
                setData([])
                setTotalRows(0)
            }
           
        }catch(error){
            console.log(error);
        }
    }

    const fetchDataCom = async () => {
        try{
            const response = await CompaniesList(userId);
            setCompanyList(response.data?.data)
        }catch(error){
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchData();
    },[])

    useEffect(() => {
        if(userId){
            fetchDataCom();
        }
    }, [userId]);

    const onCloseModal = () => {
        setOpen(false);
        setCompanyList([]);
        setUserId(null);
    }
    const onaddUserModal = () => setUserOpen(false);
    const onaddCompanyModal = () => setCompanyOpen(false);

    const deleteUserCompany = async () => {
        try{
            const response = await deleteCompany(selectedCompany);
            const updateCompany = companyList.filter((item) => item?.id !== selectedCompany);
            setCompanyList(updateCompany);
            setSelectedCompany(null);
            setShowDeleteModal(!showDeleteModal);
            if (response.data) {
                fetchData();
                setData([]);
            }
        }catch(error){
            console.log("!!!! DELETE ERROR: ", error); 
        }
    }
    //  compaones 
    let companyTableColumns = ["email", "name", "description", "invoiceCounter", "invoiceMonthlyLimit"];
    let companiesColumn = [
        {
            name: 'Email',
            selector: row => row.email ? row.email : 'NA',
        },
        {
            name: 'Name',
            selector: row => row.name ? row.name : 'NA',
        },
        {
            name: 'Description',
            selector: row => row.description ? row.description : 'NA',
        },
        {
            name: 'Invoice Counter',
            selector: row => (typeof row.invoiceCounter === "number" || row.invoiceCounter === "0") ? row.invoiceCounter : 'NA',
        },
        {
            name: 'Monthly Limit',
            selector: row => ( typeof row.invoiceMonthlyLimit === "number" || row.invoiceMonthlyLimit === "0") ? row.invoiceMonthlyLimit : 'NA',
        },
        {
            name: 'Add Count',
           cell:row =>(
            <button className="bg-[#ededed] text-[#09ba96] px-4 py-2 rounded-lg">Add Count</button>
           )
        },
        {
            name: 'Delete',
            cell: row => (
                <button>
                <button className="bg-[#ffecec] text-[#f76666] px-4 py-2 rounded-lg" onClick={(e) => { setSelectedCompany(row.id)}}>Delete</button>
            </button>
            )
        },
    ];

    const handleChange = (e)=> {
       setValue({...value,[e.target.name]:e.target.value})
    }

    const addUsrs = async(e) => {
        e.preventDefault();
        try{
            const response = await AddUsers({
                firstName: value.firstName,
                lastName: value.lastName,
                email: value.email,
                phoneNumber: value.phoneNumber,
              });
              toast.success(response.data.message);
              fetchData();
              if(response.data){
                setValue("");
                onaddUserModal(false);
              }
        }
        catch(error){
            toast.error("User already exists")

        }
    }

    const companyHandle = (e)=>{
        const name = e.target.name; 
        let value = e.target.value;
        console.log("@#@@ VALUE TYPE: ", name);
        if((name === "phone") || (name === "invoiceMonthlyLimit")){
            value = value.replace(/[^0-9]/g, '');
            setCompany((oldData) => ({
                ...oldData,
                [name]: value.replace(/[^0-9]/g, '')
            }))
        }else if(name === "email"){
            const check = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(check.test(String(value).toLowerCase())){
                setCompany({...company,[name]: value});
                setEmailError(false);
            }else{
                setCompany({...company,[name]: value});
                setEmailError(true);
            }
        }else{
            setCompany({...company,[name]: value})
        }
    }
    const addCompanySubmit = async(e) => {
        e.preventDefault();
        try{
            const response = await addCompany({
                name: company.name,
                description: company.description,
                address: company.address,
                phone: company.phone,
                email: company.email,
                user: userId,
                invoiceMonthlyLimit: Number(company.invoiceMonthlyLimit)
              });
              toast.success(response.data.message);
              fetchDataCom(userId);
              if(response.data){
                setCompany("");
                onaddCompanyModal(false);
              }
        }
        catch(error){
            toast.error("Allow field to be empty")
        }
    }
    return(
        <>
         <div className="card mb-4">
            <div className="text-end add-user relative">
                <button className="bg-[#0bc993] text-[#fff] rounded-lg px-4 py-2 font-semibold absolute top-2 -right-0 z-10" onClick={()=>{setUserOpen(true)}}>Add Users</button>
           </div>
            <FilteredDataTable
                type={"users"}
                tableColumns={userTableColumns}
                inputProps={{
                    title:"Users",
                    data: data,
                    columns: columns,
                    progressPending: loading,
                    fixedHeader: true,
                    pagination: true,
                    paginationTotalRows: totalRows,
                    customStyles: customStyles,
                    highlightOnHover: true,
                    pointerOnHover: true
                }}
            />
            <Modal open={openAddUser} classNames={{
                    modal: 'add-users-modal',
                }} onClose={onaddUserModal} center>
                    <div className="container-fluid">
                        <div className="row">
                           <div className="user-heading">
                                <h3 className="font-bold mb-1 text-2xl">Add User</h3>
                                <p>Make sure the information below is correct.</p>
                           </div>
                           <div className="form">
                            <form className="mb-3">
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        required
                                        placeholder="Email"
                                        onChange={(e)=>handleChange(e)}
                                        autoFocus />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="firstName" className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="firstName"
                                        required
                                        placeholder="First Name"
                                          onChange={(e)=>handleChange(e)}
                                        autoFocus />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="lastName" className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="lastName"
                                        required
                                        placeholder="Last Name"
                                          onChange={(e)=>handleChange(e)}
                                        autoFocus />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">Phone number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="phoneNumber"
                                        required
                                        placeholder="Phone number"
                                          onChange={(e)=>handleChange(e)}
                                        autoFocus />
                                </div>
                                {/* <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        required
                                        placeholder="Password"
                                        onChange={(e)=>handleChange(e)}
                                        autoFocus />
                                </div> */}
                                <div className="mb-3">
                                    <button 
                                        disabled={(!value?.firstName || !value?.lastName || !value.email || !value.phoneNumber)}
                                        className="btn btn-green" 
                                        type="submit" 
                                        onClick={addUsrs}
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                           </div>
                        </div>
                    </div>
            </Modal>
           <div>
            <Modal open={open} classNames={{
                    modal: 'users-modal',
                }} onClose={onCloseModal} center>
                    <div className="container-fluid">
                        <div className="text-end add-user relative">
                            <button className="bg-[#0bc993] text-[#fff] rounded-lg px-4 py-2 font-semibold absolute top-0 -right-0 z-10" onClick={()=>setCompanyOpen(true)}>Add Company</button>
                        </div>
                        <div className="row">
                            <FilteredDataTable
                                tableColumns={companyTableColumns}
                                inputProps={{
                                    title: "Companies",
                                    data: companyList,
                                    columns: companiesColumn,
                                    progressPending: loading,
                                    fixedHeader: true,
                                    pagination: true,
                                    paginationTotalRows: totalRows,
                                    customStyles: customStyles,
                                    highlightOnHover: true,
                                    pointerOnHover: true,
                                }}
                            />
                        </div>
                    </div>
                </Modal>
                <Modal open={openAddCompany} classNames={{
                    modal: 'add-companies-modal',
                    }} onClose={onaddCompanyModal} center>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="user-heading">
                                        <h3 className="font-bold mb-1 text-2xl">Add Company</h3>
                                        <p>Make sure the information below is correct.</p>
                                </div>
                                    <CustomInput
                                        title="Company Name"
                                        placeholder="Company Name"
                                        value={company?.name}
                                        setValue={(value) => setCompany((oldDetails) => ({
                                            ...oldDetails,
                                            name: value
                                        }))}
                                    />
                                    <CustomInput
                                        title="Description"
                                        placeholder="Description"
                                        value={company?.description}
                                        setValue={(value) => setCompany((oldDetails) => ({
                                            ...oldDetails,
                                            description: value
                                        }))}
                                    />
                                    <CustomInput
                                        title="Address"
                                        placeholder="Address"
                                        value={company?.address}
                                        setValue={(value) => setCompany((oldDetails) => ({
                                            ...oldDetails,
                                            address: value
                                        }))}
                                    />
                                    <CustomInput
                                        title="Phone"
                                        placeholder="Phone"
                                        value={company?.phone}
                                        setValue={(value) => setCompany((oldDetails) => ({
                                            ...oldDetails,
                                            phone: value.replace(/[^0-9.]/g, '')
                                        }))}
                                    />
                                    <CustomInput
                                        title="Email"
                                        placeholder="Email"
                                        value={company?.email}
                                        setValue={(value) => {
                                            const check = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                            if(check.test(String(value).toLowerCase())){
                                                setCompany((oldData) => ({
                                                    ...oldData,
                                                    email: value
                                                }))
                                                setEmailError(false);
                                            }else{
                                                setCompany((oldData) => ({
                                                    ...oldData,
                                                    email: value
                                                }))
                                                setEmailError(true);
                                            }
                                        }}
                                    />
                                    {(!!company?.email && emailError) && (
                                        <span className="text-danger">Invalid email</span>
                                    )}
                                    <CustomInput
                                        title="Monthly Count"
                                        placeholder="Monthly Count"
                                        value={company?.invoiceMonthlyLimit}
                                        setValue={(value) => setCompany((oldDetails) => ({
                                            ...oldDetails,
                                            invoiceMonthlyLimit: value.replace(/[^0-9.]/g, '')
                                        }))}
                                    />
                                    <div className="mb-3">
                                        <button 
                                            disabled={(!company?.name || !company?.description || !company?.address || !company.phone || !company.invoiceMonthlyLimit || emailError)}
                                            className=" mt-3 btn btn-green" 
                                            type="submit" 
                                            onClick={addCompanySubmit}
                                        >
                                            Save
                                        </button>
                                    </div>
                            </div>
                        </div>
                </Modal>
                <ConfirmDeleteModal
                    subTitle={"Are you sure you want to delete this company ?"}
                    open={showDeleteModal}
                    onCloseModal={() => { 
                        setShowDeleteModal(!showDeleteModal);
                        setSelectedCompany(null);
                    }}
                    deleteProduct={deleteUserCompany}
                />
            </div>
         </div>
        </>
    )
}
export default Users;