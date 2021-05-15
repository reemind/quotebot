import { message } from 'antd';
import { Button } from 'antd/lib/radio'
import React from 'react'

const key = "Report"

const mesloading = () => {
    message.loading({ key, content: "Loading..." })
};
const mesError = () => {
    message.error({ key, content: "Error", duration: 2 })
};
const mesSuccess = () => {
    message.success({ key, content: "Success", duration: 2 })
};

interface GetReportButtonProps {
    url: string
    filename?: string
}

const GetReportButton: React.FC<GetReportButtonProps> =
    ({url, filename}) => (<Button onClick={() => {
        mesloading()
        fetch(url, {
            method: 'GET',
            headers: new Headers({
                "Authorization": "Bearer " + localStorage.getItem("token")
            })
        })
            .then(response => response.blob())
            .then(blob => {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = filename ? filename+".xlsx":"file.xlsx";
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove();  //afterwards we remove the element again      
                mesSuccess();
            })
            .catch(() => mesError());
    }}>Make report</Button>)


export default GetReportButton