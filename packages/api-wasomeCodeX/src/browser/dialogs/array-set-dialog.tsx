import * as React from 'react';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';

interface options<T = any> {
    initialValue?: T;
}
interface ArrayRange {
    start: number | '';
    end: number | '';
}

export class ArraySetDialog extends ReactDialog<any> {
    protected isArray: boolean;
    protected ranges: ArrayRange[];
    protected error: string = '';

    constructor(options: options<any>) {
        super({ title: '数组设置' });
        this.appendCloseButton('Cancel');
        this.appendAcceptButton('OK');
        const initial = options.initialValue;
        if (initial && typeof initial === 'object') {
            this.isArray = initial.isArray ?? true;
            const arr = initial.arrItems;
            this.ranges = Array.isArray(arr) && arr.length > 0
                ? arr.map(r => ({ start: r.start ?? '', end: r.end ?? '' }))
                : [{ start: 0, end: 1 }];
        } else {
            this.isArray = true;
            this.ranges = [{ start: 0, end: 1 }];
        }
    }

    get value(): any {
        return {
            isArray: this.isArray,
            ranges: this.isArray ? this.ranges : undefined
        };
    }

    protected render(): React.ReactNode {
        // 只显示有值的维度
        let dims: string[] = [];
        this.ranges.forEach((dim) => {
            const s = dim.start === '' || isNaN(Number(dim.start)) ? '?' : dim.start;
            const e = dim.end === '' || isNaN(Number(dim.end)) ? '?' : dim.end;
            dims.push(`${s}..${e}`);
        });
        const resultStr = this.isArray && dims.length > 0 ? `ARRAY[${dims.join(',')}]` : '';

        return (
            <div className="array-set-box" style={{ minWidth: 320 }}>
                <div className="checkbox-line">
                    <input
                        type="checkbox"
                        checked={this.isArray}
                        onChange={e => {
                            this.isArray = e.target.checked;
                            this.update();
                        }}
                    />
                    <span>是否设置为数组</span>
                </div>
                {this.isArray && (
                    <>
                        <div>
                            {this.ranges.map((_, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{ minWidth: 60 }}>第{i + 1}维</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100000"
                                        placeholder="start"
                                        value={this.ranges[i].start}
                                        onChange={e => this.handleRangeChange(i, 'start', e.target.value)}
                                        style={{ width: 60 }}
                                    />
                                    <span style={{ margin: '0 6px' }}>..</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100000"
                                        placeholder="end"
                                        value={this.ranges[i].end}
                                        onChange={e => this.handleRangeChange(i, 'end', e.target.value)}
                                        style={{ width: 60 }}
                                    />
                                    {/* 加减按钮 */}
                                    <button
                                        style={{ marginLeft: 8 }}
                                        disabled={this.ranges.length >= 3}
                                        onClick={() => this.handleAddDimension(i)}
                                    >＋</button>
                                    <button
                                        style={{ marginLeft: 2 }}
                                        disabled={this.ranges.length <= 1}
                                        onClick={() => this.handleRemoveDimension(i)}
                                    >－</button>
                                </div>
                            ))}
                        </div>
                        <div>
                            <label>显示结果</label>{resultStr}
                        </div>
                    </>
                )}
                <div className="error">{this.error}</div>
            </div>
        );
    }

    protected handleRangeChange(index: number, key: 'start' | 'end', value: string) {
        const num = value === '' ? '' : Number(value);
        this.ranges[index] = { ...this.ranges[index], [key]: num };
        this.update();
    }

    protected handleAddDimension(index: number) {
        if (this.ranges.length < 3) {
            this.ranges.splice(index + 1, 0, { start: 0, end: 1 });
            this.update();
        }
    }

    protected handleRemoveDimension(index: number) {
        if (this.ranges.length > 1) {
            this.ranges.splice(index, 1);
            this.update();
        }
    }

    protected override async accept(): Promise<void> {
        if (!this.isArray) {
            if (this.resolve) {
                this.resolve({ isArray: false });
            }
            this.dispose();
            return;
        }
        // 校验每一维
        for (let i = 0; i < this.ranges.length; i++) {
            const { start, end } = this.ranges[i];
            if (start === '' || end === '') {
                this.error = `第${i + 1}维 start 和 end 必填`;
                this.update();
                return;
            }
            if (Number(start) > Number(end)) {
                this.error = `第${i + 1}维 start 不能大于 end`;
                this.update();
                return;
            }
        }
        this.error = '';
        this.update();
        // 输出所有维度
        const result: ArrayRange[] = this.ranges.map(r => ({ start: Number(r.start), end: Number(r.end) }));
        if (this.resolve) {
            this.resolve({ isArray: true, ranges: result });
        }
        this.dispose();
    }
}
