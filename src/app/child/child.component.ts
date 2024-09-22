import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Observable, Subject, Subscription, take, takeUntil, tap} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

/**
 * Вариант option1.
 * .subscribe возвращает Subscription.
 * У этого объекта есть unsubscribe. Когда нам нандо мы можем его вызвать, но перед этим надо схранить.
 * Можно сохранить либо в прееменную, либо если есть несколько подписок, можно создать массив, а потом через forEach отписаться.
 * Обычно .unsubscribe вызывается в onDestroy, но бывают и другие случаи.
 * Это топ 5 вариант.
 * */

/**
 * Вариант option2.
 * Использовать RxJs. Начнём с сабжектов. Можно отписатсья с помозщью эмита сабджекта.
 * Тут так же как и выще. Можно сделать через OnDestroy, что бывает чаще всего. Но можно и где ты захочешь.
 * Топ 4
 * */

/**
 * Вариант option3.
 * Использовать RxJs. take(n), где n-число, first().
 * Эти операторы возьмут 1 событие (first()) или n значений из потока и сами отпишутся.
 * Топ 3. Даже когда делаешь отписку через эти операторы,
 * вроде как стоит всё равно добавлять оператор из следующего шага.
 * */

/**
 * Вариант option4.
 * Используем библиотеку until-destroy. Я установил её уже в package.json.
 * Топ 2. Потому что передал функицю и всё. Но если можно лучше использовать следующий вариант.
 * */

/**
 * Вариант option5.
 * Используем async пайп.
 * Топ 1. Но не всегда получается использовать async пайп.
 * */

/**
 * В целом я использую оператор take(1) когда хочу чтобы произошёл эмит 1 раз.
 * Кстати помни что любые запросы на бэк так и так под капотом уже с take(1),
 * но takeUntilDestroyed(this) всё равно надо юзать.
 * Если мне надо получить значение больше 1 раза, то использую просто takeUntilDestroyed(this),
 * если нет варината заюзать async пайп. Иначе использую async пайп.
 * Остальное за все время работы использовал 1 раз. Просто потому что там больше когда писать. Но это надо знать,
 * чтобы понимать как всё работает под капотом.
 * Кстати вот ещё статья по поводу отписок.
 * https://habr.com/ru/articles/484762/
 * https://medium.com/p/ee0c62b5d21f/
 * А это запомни навсегда https://t.me/angular_fox/80.
 *
 *
 * АХНУТЬ!
 *
 * Кстати, видать в 18 ангуляре в бета версии выкатили takeUntilDestroyed. Это тож самое что и Вариант option4,
 * но без использования библиотек. Можешь попробовать это, но я не тестил.
 * https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed
 * */


// Option4. Шаг 1. Для начала навешиваем декторатор UntilDestroy() на наш компонент/директиву, крч что угодно ангуляровское.
@UntilDestroy()
@Component({
  selector: 'app-child',
  standalone: true,
  imports: [
    AsyncPipe
  ],
  templateUrl: './child.component.html',
  styleUrl: './child.component.scss'
})
export class ChildComponent implements OnInit, OnDestroy {
  /**
   * Option1. Отписка с помозью async пайпа. Посмотри в child.component.html
   * */
  option1 = this.getBack('Option1');

  /**
   * Option1. Поле, куда мы сохраняем Subscription, чтобы потом описаться.
   * */
  option1Subscription?: Subscription;

  /**
   * Option2. Отписка с помощью RxJs.
   * */
  option2 = this.getBack('Option2');

  /**
   * Option2. Шаг 1. Создаем сабджект по которому будем отписываться
   * */
  option2UnsubscribeSubject = new Subject<void>()

  /**
   * Option3. Отписка с помощью RxJs. take(n) и first()
   * */
  option3 = this.getBack('Option3');

  /**
   * Option4. Отписка с помощью библиотеки. until-destroy.
   * */
  option4 = this.getBack('Option4');

  /**
   * Option3. Отписка с помощью async пайпа. Посмотри в child.component.html.
   * */
  option5 = this.getBack('Option5');


  ngOnInit(): void {
    // Option1. Шаг 1. Подписываемся и сохраняем результать (Subscription).
    this.option1Subscription = this.option1.subscribe()

    //Option2. Шаг 2. Подписываемся и передаём сабджект, по которому у нас будет происходить отписка.
    this.option2.pipe(takeUntil(this.option2UnsubscribeSubject)).subscribe();

    //Option3. Шаг 1. Подписываемся и указываем кол-во значений после которого надо отписаться. Ну и всё собственно.
    this.option3.pipe(take(10)).subscribe()

    //Option4. Шаг 2. Подписываеся и передаём функцию untilDestroyed(this). Ну и всё. библиотека сделает всё сама.
    this.option4.pipe(untilDestroyed(this)).subscribe()
  }

  ngOnDestroy() {
    // Option1. Шаг 2. Отписываемся во время уничтожения компоннета.
    this.option1Subscription?.unsubscribe();

    // Option2. Шаг 3. Ну и собственно эмитим наш сабджект.
    this.option2UnsubscribeSubject.next();
  }

  getBack(optionNumber: string): Observable<number>{
    return interval(1000).pipe(tap((v)=>console.log(optionNumber+': ',v)));
  }
}
