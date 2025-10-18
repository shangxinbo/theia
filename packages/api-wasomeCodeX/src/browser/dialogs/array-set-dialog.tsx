import * as React from 'react';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';

interface options<T = any> {
    initialValue?: T;
}
interface ArrayRange {
    start: number | '';
    end: number | '';
}

export class ArraySetDialog extends ReactDialog<ArrayRange[]> {
    protected ranges: ArrayRange[];
    protected error: string = '';

    constructor(options: options<ArrayRange[]>) {
        super({ title: '数组设置' });
        this.appendCloseButton('Cancel');
        this.appendAcceptButton('OK');
        const arr = options.initialValue;
        this.ranges = arr ? [
            arr[0] || { start: '', end: '' },
            arr[1] || { start: '', end: '' }
        ] : [
            { start: '', end: '' },
            { start: '', end: '' }
        ];
    }


    get value(): ArrayRange[] {
        return this.ranges;
    }

    protected render(): React.ReactNode {
        // 只显示有值的维度，第二维必须有第一维才显示
        let dims: string[] = [];
        const first = this.ranges[0];
        const second = this.ranges[1];
        const s1 = first.start === '' || isNaN(Number(first.start)) ? '?' : first.start;
        const e1 = first.end === '' || isNaN(Number(first.end)) ? '?' : first.end;
        if (first.start !== '' || first.end !== '') {
            dims.push(`${s1}..${e1}`);
        }
        if (dims.length === 1 && (second.start !== '' || second.end !== '')) {
            const s2 = second.start === '' || isNaN(Number(second.start)) ? '?' : second.start;
            const e2 = second.end === '' || isNaN(Number(second.end)) ? '?' : second.end;
            dims.push(`${s2}..${e2}`);
        }
        const resultStr = dims.length > 0 ? `ARRAY[${dims.join(',')}]` : '';

        return (
            <div className="array-set-box" style={{ minWidth: 320 }}>
                {this.ranges.map((_, i) => (
                    <div key={i}>
                        <label>第{i + 1}维</label>
                        <input
                            type="number"
                            max="100000"
                            placeholder="start"
                            value={this.ranges[i].start}
                            onChange={e => this.handleRangeChange(i, 'start', e.target.value)}
                        />
                        <span style={{ margin: '0 6px' }}>..</span>
                        <input
                            type="number"
                            max="100000"
                            placeholder="end"
                            value={this.ranges[i].end}
                            onChange={e => this.handleRangeChange(i, 'end', e.target.value)}
                        />
                    </div>
                ))}
                <div>
                    <label>显示结果</label>{resultStr}
                </div>
                <div className="error">{this.error}</div>
            </div>
        );
    }

    protected handleRangeChange(index: number, key: 'start' | 'end', value: string) {
        const num = value === '' ? '' : Number(value);
        this.ranges[index] = { ...this.ranges[index], [key]: num };
        this.update();
    }

    protected override async accept(): Promise<void> {
        // 第一维必填
        const { start: s1, end: e1 } = this.ranges[0];
        if (s1 === '' || e1 === '') {
            this.error = '第1维 start 和 end 必填';
            this.update();
            return;
        }
        if (Number(s1) > Number(e1)) {
            this.error = '第1维 start 不能大于 end';
            this.update();
            return;
        }
        // 第二维可选，有值时校验
        const { start: s2, end: e2 } = this.ranges[1];
        if ((s2 !== '' || e2 !== '')) {
            if (s2 === '' || e2 === '') {
                this.error = '第2维 start 和 end 必须都填或都不填';
                this.update();
                return;
            }
            if (Number(s2) > Number(e2)) {
                this.error = '第2维 start 不能大于 end';
                this.update();
                return;
            }
        }
        this.error = '';
        this.update();
        // 输出只包含已填写的维度
        const result: ArrayRange[] = [
            { start: Number(s1), end: Number(e1) }
        ];
        if (s2 !== '' && e2 !== '') {
            result.push({ start: Number(s2), end: Number(e2) });
        }
        if (this.resolve) {
            this.resolve(result);
        }
        this.dispose();
    }
}
