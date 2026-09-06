# Isolate process-wide allocation regression

## 中文

Ubuntu CI 在零分配 unit test 中记录了其他 libtest 线程的 2 次释放。
窗口 mutex 仅排斥其他测量窗口，不能排斥所有线程的分配。将零分配回归移到
integration test，由独立 CLI 进程运行无调用 polynomial，验证 JSON、正确性与
零 alloc/realloc/requested bytes；不把输入释放误认成分配。补齐 source-backed
unit matrix 的 polynomial 分类。只修改测试，benchmark runtime 与旧报告不变。

## English

Ubuntu CI exposed two unrelated libtest deallocations in the zero-allocation unit
test. The window mutex excludes other windows, not all process threads. Move the
regression to an integration test launching the actual polynomial CLI in isolation;
assert valid/correct JSON and zero allocation/reallocation/requested bytes, without
confusing consumed-input deallocation with allocation. Add polynomial to the unit
matrix. Runtime measurement and archived bytes are unchanged.
