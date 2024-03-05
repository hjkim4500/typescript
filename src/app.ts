//데코레이션
//!!! 데코레이터도 함수다!
//클래스나 클래스 메서드가 올바르게 사용되었는지 확인하는 작업이나, 내부적인 변환 작업등을 수행하는데 사용

// function Logger(constructor: Function) {
//     console.log("Logging...");
//     console.log(constructor);
// }

function Logger(logString: string) {
    // 이렇게 해야지 원하는 값을 추가를 할 수가 있음!
    console.log("Logger Factory");
    return function (constructor: Function) {
        console.log(logString);
        console.log(constructor);
    };
}

function WithTemplate(template: string, hookId: string) {
    console.log("Template Factory");
    return function (constructor: any) {
        // constructor인데 constructor에 대해 사용하지 않으니 _로 쓴것(인자가 들어오는 건 알지만 필요하지 않음을 나타냄)
        console.log("Rendering template");
        const p = new constructor();
        const hookEl = document.getElementById(hookId);
        if (hookEl) {
            hookEl.innerHTML = template;
            hookEl.querySelector("h1")!.textContent = p.name;
        }
    };
}

//클래스  =>WithTemplate => Logger 로 실행이 됨. constructor일때
@Logger("Logging")
@WithTemplate("<h1>My person Object</h1>", "app") //생성자 함수를 실행하면서 이 부분도 실행이 되기 때문
class Person {
    name = "HJ";

    constructor() {
        console.log("Creating person object...");
    }

    hello() {
        console.log(123123123123);
    }
}

const pers = new Person();
console.log(pers);

// ---
function Log(target: any, propertyName: string | Symbol) {
    //프로퍼티에 데코레이터를 추가하면 데코레이터로 2개의 인자가 들어옴 외워! 첫번째 인자 프로퍼티의 타겟 두번째 인자는 프로퍼티 이름이 들어옴
    console.log("property decorator!");
    console.log(target, propertyName);
}

class Product {
    @Log //이 로그는 title 바로 위에만 있기 때문에 밑에는 적용이 되지 않음
    title: string;

    // @Log
    private _price: number;

    set price(val: number) {
        if (val > 0) {
            this._price = val;
        } else {
            throw new Error("Invalid price - should be postive!");
        }
    }

    constructor(t: string, p: number) {
        this.title = t;
        this._price = p;
    }

    getPriceWithTax(tax: number) {
        return this._price * (1 + tax);
    }
}
