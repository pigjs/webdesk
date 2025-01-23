import { GithubOutlined } from "@ant-design/icons"

export const Header = () => {
    return (
        <header>
            <div className="flex items-center justify-between w-[1200px] h-16 mx-auto px-6 text-sm">
                <h1 className="relative">
                    <a href="/" className="block w-[120px] h-8" style={{ background: "url('/logo.png') no-repeat 0 50%", backgroundSize: '120px 32px' }}>
                        <span className="sr-only">webdesk</span>
                    </a>
                    <span className="absolute top-[11px] left-[134px] w-px h-3 bg-gray-400"></span>
                    <span className="absolute top-[6px] left-[156px] text-[rgba(0,0,0,0.65)] font-normal text-sm whitespace-nowrap">网站打包桌面端</span>
                </h1>
                <a className='text-lg' href='https://github.com/pigjs/webdesk' target='_blank' rel='noreferrer' ><GithubOutlined /></a>
            </div>
        </header>
    )
}