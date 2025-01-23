import { DeskTopAppForm } from "./components/desktopAppForm";

export default function Home() {
    return (
        <div className="p-4 h-full" >
            <h1 className="mb-9 text-[32px] text-[#212121] font-medium text-center">一键将网站转化为桌面应用程序</h1>
            <DeskTopAppForm />
        </div>
    )
}