import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Modal from "react-modal";
import "./ModalStyles.css";
import { BsFillLockFill } from "react-icons/bs";
import { FaTicketAlt, FaPlusSquare } from "react-icons/fa";
import { useTable, usePagination, useGlobalFilter } from "react-table";

Modal.setAppElement("#root");

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;

  return (
    <span>
      Search:{" "}
      <input
        value={globalFilter || ""}
        onChange={(e) => {
          setGlobalFilter(e.target.value || undefined);
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: "1.1rem",
          padding: "0.2rem",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
    </span>
  );
}

function LeftPart() {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const authEmail = auth?.nuser?.email;

  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg2, setMsg2] = useState("");

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const closeModal = () => {
    setConfirmationOpen(false);
  };

  const [passwordError, setPasswordError] = useState("");

  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const openPwdModal = (email) => {
    setPasswordData((prevState) => ({
      ...prevState,
      email,
    }));
    setPwdModalOpen(true);
  };

  const closePwdModal = () => {
    setPasswordData({
      password: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setPwdModalOpen(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    const { email, password, confirmPassword } = passwordData;

    if (password !== confirmPassword) {
      setPasswordError("Password and confirm password do not match!");
      return;
    }

    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;
    if (!regex.test(password)) {
      setPasswordError(
        "Invalid password. It should contain at least one lowercase letter, one uppercase letter, one numeric digit, one special character and it should be at least eight characters long."
      );
      return;
    }

    try {
      await axiosPrivate.post("/changePassword", {
        email,
        pwd: password,
      });
      alert("User password changed successfully");
      setPasswordError("");
      closePwdModal();
    } catch (error) {
      if (error.response) {
        setPasswordError(error.response.data);
      } else if (error.request) {
        setPasswordError(error.request);
      } else {
        setPasswordError(error.message);
      }
    }
  };

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    index: -1,
    selectedRole: "",
  });

  const ROLES_LIST = {
    Sadmin: 3007,
    Admin: 5150,
    Editor: 1984,
    User: 2001,
    Disable: 1001,
  };

  const fetchUserData = async () => {
    try {
      const response = await axiosPrivate.get("/fetchuser");
      setUserData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleRoleChange = (event, index) => {
    const selectedRole = event.target.value;
    setConfirmationData({ index, selectedRole });
    setConfirmationOpen(true);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const confirmUpdateRoles = async () => {
    const { index, selectedRole } = confirmationData;
    setConfirmationOpen(false);

    const updatedUserData = [...userData];
    const updatedUser = { ...updatedUserData[index] };

    switch (selectedRole) {
      case "Super Admin":
        updatedUser.roles = {
          User: 2001,
          Sadmin: 3007,
        };
        break;
      case "Administrator":
        updatedUser.roles = {
          User: 2001,
          Admin: 5150,
        };
        break;
      case "Moderator":
        updatedUser.roles = {
          User: 2001,
          Editor: 1984,
        };
        break;
      case "Disable":
        updatedUser.roles = {
          Disable: 1001,
        };
        break;
      default:
        updatedUser.roles = {
          User: 2001,
        };
    }

    updatedUser.selectedRole = selectedRole;
    updatedUserData[index] = updatedUser;
    setUserData(updatedUserData);

    try {
      await axiosPrivate.put("/users", {
        email: updatedUser.email,
        roles: updatedUser.roles,
      });
      await fetchUserData();
    } catch (error) {
      console.error("Error updating user roles:", error.message);
    }
  };

  const unitOptions = [
    { label: "Choose one", value: "" },
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "30", value: "30" },
    { label: "40", value: "40" },
    { label: "50", value: "50" },
    { label: "60", value: "60" },
    { label: "70", value: "70" },
    { label: "80", value: "80" },
    { label: "90", value: "90" },
    { label: "100", value: "100" },
    { label: "500", value: "500" },
    { label: "1000", value: "1000" },
  ];

  const handleChange2 = ({ currentTarget: input }) => {
    const selectedAmount = parseInt(input.value);
    setData({ ...data, [input.name]: selectedAmount });
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsLoading(true);
      const url = "/voucher";
      const { data: res } = await axiosPrivate.post(url, data);

      alert(`${data.amount} voucher added`);
      setIsLoading(false);
      closeVoucherModal();

      await fetchUserData();
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const openVoucherModal = (email) => {
    setData((prevState) => ({
      ...prevState,
      email,
    }));
    setVoucherModalOpen(true);
  };

  const closeVoucherModal = () => {
    setData({
      email: "",
      amount: "",
    });
    setError("");
    setVoucherModalOpen(false);
  };

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [unitData, setUnitData] = useState({
    email: "",
    amount: "",
  });

  const openUnitModal = (email) => {
    setUnitData((prevState) => ({
      ...prevState,
      email,
    }));
    setUnitModalOpen(true);
  };

  const closeUnitModal = () => {
    setUnitData({
      email: "",
      amount: "",
    });
    setError("");
    setUnitModalOpen(false);
  };

  const handleUnitChange = ({ currentTarget: input }) => {
    const selectedAmount = parseInt(input.value);
    setUnitData({ ...unitData, [input.name]: selectedAmount });
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let dataToSend = { ...unitData, amount: Number(unitData.amount) };

    try {
      setIsLoading(true);
      const url = "/updateunit";
      const { data: res } = await axiosPrivate.post(url, dataToSend);
      setIsLoading(false);
      alert(`${dataToSend.amount} unit added`);
      closeUnitModal();
      await fetchUserData();
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "First Name",
        accessor: "firstName",
      },
      {
        Header: "Last Name",
        accessor: "lastName",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Roles",
        accessor: "selectedRole",
        Cell: ({ row }) => {
          const user = row.original;
          return (
            <select
              value={user.selectedRole}
              onChange={(event) => handleRoleChange(event, row.index)}
            >
              <option value="User">User</option>
              <option value="Administrator">Administrator</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="Disable">Disable</option>
            </select>
          );
        },
      },
      {
        Header: "AU",
        accessor: "au",
      },
      {
        Header: "UU",
        accessor: "uu",
      },
      {
        Header: "AV",
        accessor: "Av",
      },
      {
        Header: "UV",
        accessor: "Uv",
      },
      {
        Header: "Action",
        Cell: ({ row }) => {
          const user = row.original;
          return (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <BsFillLockFill
                onClick={() => openPwdModal(user.email)}
                style={{
                  display: "inline-block",
                  marginRight: "5px",
                }}
              />
              <FaTicketAlt
                onClick={() => openVoucherModal(user.email)}
                style={{
                  display: "inline-block",
                  marginRight: "5px",
                }}
              />
              <FaPlusSquare
                onClick={() => openUnitModal(user.email)}
                style={{
                  display: "inline-block",
                  marginRight: "5px",
                }}
              />
            </div>
          );
        },
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: userData,
    },
    useGlobalFilter,
    usePagination
  );

  return (
    <div className="col-span-12 border-r border-gray-200 items-start justify-start flex flex-col w-full">
      {/* top section*/}
      <div className="w-full items-start justify-start flex flex-col px-12 pt-12 pb-6">
        <h1 className="font-bold text-xl xl:text-2xl pb-2 "> View Users </h1>
        <p className="text-md text-gray-800">Users information below</p>
        <div className="w-full mt-4">
          <div className="overflow-x-auto">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="table-container">
                <GlobalFilter
                  preGlobalFilteredRows={preGlobalFilteredRows}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                />
                <table
                  {...getTableProps()}
                  style={{ width: "100%" }}
                  cellPadding={10}
                >
                  <colgroup>
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <thead>
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                          <th {...column.getHeaderProps()}>
                            {column.render("Header")}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()}>
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div>
                  <button
                    onClick={() => gotoPage(0)}
                    disabled={!canPreviousPage}
                  >
                    {"<<"}
                  </button>{" "}
                  <button
                    onClick={() => previousPage()}
                    disabled={!canPreviousPage}
                  >
                    {"<"}
                  </button>{" "}
                  <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {">"}
                  </button>{" "}
                  <button
                    onClick={() => gotoPage(pageCount - 1)}
                    disabled={!canNextPage}
                  >
                    {">>"}
                  </button>{" "}
                  <span>
                    Page{" "}
                    <strong>
                      {pageIndex + 1} of {pageOptions.length}
                    </strong>{" "}
                  </span>
                  <span>
                    | Go to page:{" "}
                    <input
                      type="number"
                      defaultValue={pageIndex + 1}
                      onChange={(e) => {
                        const page = e.target.value
                          ? Number(e.target.value) - 1
                          : 0;
                        gotoPage(page);
                      }}
                      style={{ width: "100px" }}
                    />
                  </span>{" "}
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                    }}
                  >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ... */}
      <Modal
        isOpen={confirmationOpen}
        onRequestClose={closeModal}
        className="ModalContainer"
        overlayClassName="ModalOverlay"
      >
        <div className="ModalContent">
          <h2 className="ModalTitle">Confirmation</h2>
          <p className="ModalText">
            Are you sure you want to update the role to{" "}
            {confirmationData.selectedRole}?
          </p>
          <div className="ModalButtonContainer">
            <button
              className="ModalButton Primary"
              onClick={confirmUpdateRoles}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Confirm"}
            </button>
            <button className="ModalButton Secondary" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={pwdModalOpen}
        onRequestClose={closePwdModal}
        className="ModalContainer"
        overlayClassName="ModalOverlay"
      >
        <div className="PasswordModalContent">
          <h2 className="ModalTitle">Change Password</h2>

          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              name="password"
              placeholder="New password"
              value={passwordData.password}
              onChange={handlePasswordInputChange}
              className="ModalInput"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
              className="ModalInput"
            />
            <p className={`ModalText ${passwordError ? "Error" : ""}`}>
              {passwordError}
            </p>

            <div className="ModalButtonContainer">
              <button
                type="submit"
                className="ModalButton Primary"
                disabled={isLoading}
              >
                {isLoading ? "Changing..." : "Change Password"}
              </button>
              <button className="ModalButton Secondary" onClick={closePwdModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={voucherModalOpen}
        onRequestClose={closeVoucherModal}
        className="ModalContainer"
        overlayClassName="ModalOverlay"
      >
        <div className="VoucherModalContent">
          <h2 className="ModalTitle">Add Voucher</h2>

          <form onSubmit={handleSubmit2}>
            <select
              name="amount"
              value={data.amount}
              onChange={handleChange2}
              className="ModalInput"
            >
              {unitOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <p className={`ModalText ${error ? "Error" : ""}`}>{error}</p>

            <div className="ModalButtonContainer">
              <button
                type="submit"
                className="ModalButton Primary"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Voucher"}
              </button>
              <button
                className="ModalButton Secondary"
                onClick={closeVoucherModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={unitModalOpen}
        onRequestClose={closeUnitModal}
        className="ModalContainer"
        overlayClassName="ModalOverlay"
      >
        <div className="UnitModalContent">
          <h2 className="ModalTitle">Add Unit</h2>

          <form onSubmit={handleUnitSubmit}>
            <select
              name="amount"
              value={unitData.amount}
              onChange={handleUnitChange}
              className="ModalInput"
            >
              {unitOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <p className={`ModalText ${error ? "Error" : ""}`}>{error}</p>

            <div className="ModalButtonContainer">
              <button
                type="submit"
                className="ModalButton Primary"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Unit"}
              </button>
              <button
                className="ModalButton Secondary"
                onClick={closeUnitModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default LeftPart;
