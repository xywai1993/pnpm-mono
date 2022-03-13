const {usePathToPosix,usePathInfo} = require("../lib/utils.cjs");

test('usePathToPosix is ok',()=>{
    const str = usePathToPosix('c:\\abc\\dfg');
    const str2 = usePathToPosix('abc/dfg')

    expect(str).toBe('c:/abc/dfg');
    expect(str2).toBe('abc/dfg')
})

test('usePathInfo is ok',()=>{
    const winPath = usePathInfo('c:\\abc\\dfg\\demo.js')
    const macPath = usePathInfo('abc/dfg/demo2.cjs');

    expect(winPath.dirSrc).toBe('c:\\abc\\dfg')
    expect(winPath.extName).toBe('.js');
    expect(winPath.fileName).toBe('demo')

    expect(macPath.dirSrc).toBe('abc/dfg')
    expect(macPath.extName).toBe('.cjs');
    expect(macPath.fileName).toBe('demo2')
})