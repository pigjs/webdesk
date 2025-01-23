import { Suspense } from "react";
import { DownloadClient } from "./downloadClient";
import { Spin } from "antd";

export default function Download() {
    return (
        <Suspense fallback={(
            <div className="flex justify-center items-center h-[100vh]">
                <Spin size="large" />
            </div>
        )} >
            <DownloadClient />
        </Suspense>
    )
}