## Домашнее задание по ТРВП, вариант 001

Приложение личного кабинета менеджера интернет-провайдера создано на основе NextJS

Разработать клиент-серверное приложение, реализующее функциональные требования (CRUD-операции), заданные в пределах
указанной предметной области, с соблюдением следующих технических требований:

* Клиентская сторона приложения должна быть разработана с использованием языка разметки HTML, таблиц стилей CSS и языка
  программирования JavaScript. Разрешено использовать любую библиотеку/фреймворк для построения пользовательского
  веб-интерфейса.
* Серверная сторона приложения должна быть разработана с использованием языка программирования JavaScript и платформы
  Node.js. Разрешено использовать любую библиотеку/фреймворк для создания сервера.
* Взаимодействие между клиентом и сервером должно осуществляться через спроектированный REST-like API.
* Данные на серверной стороне должны храниться в базе данных. Разрешено использовать любую БД и СУБД, к которой возможно
  подключиться из JavaScript кода.
* Вместо JavaScript разрешено использовать TypeScript.

Приложение реализовано на фреймворке NextJS. В процессе разработки данного приложения в части разработки отдельного
бэкенда и REST API , поскольку уже неоднократного имел с ними дело.
NextJS предоставляет серверные компоненты React и server actions, так как я решил изучить этот фреймвор, я решил
возпользоваться его возможностями (+ интересно было попробовать что то новое).
Также приложение вместе с БД было развернуто на хостинге Versel, доступно по
ссылке https://trvp-baumconnect.vercel.app/.
Данные для входа:

* email: Manager@trvp.com
* pass: 123456

Приложение адаптивно под любой формат экрана.

## Немного о приложении

1) Страница Masters:
   На этой странице расположена таблица всех мастеров, имеется функционал добавления нового мастера, обновление
   информации об уже добавленный, а так же запись о мастере можно удалить.
2) Страница Applications:
   На этой странице расположена таблица всех заявок. Заявки можно добавлять, удалять и редактировать. Каждая заявка
   закрепляется за определенным мастером (учтены все ограничения по ТЗ, связанные со сложностью - поле Complexity).
   Заявка может иметь один из доступных статусов: уже выполнена, либо ожидает исполнения (если заявка выполнена, то ее
   сложность не учитывается для мастера)
3) Страница Home:
   На данной странице подводится статистика: общая выручка всех мастеров за выполненные заявки, сумма выручки за заявки,
   ожидающие выполнения, общее количество заявок и количество мастеров. Также выведены последние 5 заявок.

    
