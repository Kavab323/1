# edo_console.py
"""
Консольное приложение для эмуляции электронного документооборота.
Функции:
- добавление документа (автор, название)
- просмотр всех документов с их статусами
- перевод документа в следующий статус (Черновик -> На согласовании -> Утверждён/Отклонён)
- учёт ролей (упрощённо: автор создаёт, согласующий утверждает/отклоняет)
"""

import uuid
from datetime import datetime

# ---------------------- Модель данных ----------------------
class Document:
    def __init__(self, title, author_name):
        self.doc_id = str(uuid.uuid4())[:8]   # короткий ID
        self.title = title
        self.author = author_name
        self.status = "Черновик"
        self.created_at = datetime.now()
        self.approver = None   # кто будет согласующим (задаётся при отправке)

    def to_dict(self):
        return {
            "id": self.doc_id,
            "title": self.title,
            "author": self.author,
            "status": self.status,
            "created": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "approver": self.approver
        }

# ---------------------- Хранилище ----------------------
documents = []   # список объектов Document

# ---------------------- Бизнес-логика ----------------------
def add_document(title, author_name):
    """Создать новый документ в статусе 'Черновик'."""
    doc = Document(title, author_name)
    documents.append(doc)
    print(f"✅ Документ '{title}' добавлен. ID: {doc.doc_id}, статус: Черновик")
    return doc

def list_documents():
    """Показать все документы с их статусами."""
    if not documents:
        print("📭 Список документов пуст.")
        return
    print("\n" + "="*70)
    print(f"{'ID':<10}{'Название':<25}{'Автор':<15}{'Статус':<15}{'Согласующий':<10}")
    print("-"*70)
    for d in documents:
        approver = d.approver if d.approver else "—"
        print(f"{d.doc_id:<10}{d.title[:24]:<25}{d.author:<15}{d.status:<15}{approver:<10}")
    print("="*70)

def change_status(doc_id, new_status, user_role=None, approver_name=None):
    """
    Изменить статус документа с проверкой возможных переходов.
    Упрощённо: роль влияет на то, можно ли перевести в 'Утверждён'/'Отклонён'.
    """
    doc = next((d for d in documents if d.doc_id == doc_id), None)
    if not doc:
        print(f"❌ Документ с ID {doc_id} не найден.")
        return False

    old = doc.status

    # Правила переходов (конечный автомат)
    if old == "Черновик" and new_status == "На согласовании":
        if not approver_name:
            print("❌ Для отправки на согласование укажите имя согласующего.")
            return False
        doc.approver = approver_name
        doc.status = new_status
        print(f"📤 Документ '{doc.title}' отправлен на согласование. Согласующий: {approver_name}")
        return True

    elif old == "На согласовании" and new_status in ["Утверждён", "Отклонён"]:
        # только согласующий может менять на эти статусы
        if user_role != "approver":
            print(f"❌ Только согласующий ({doc.approver}) может утвердить или отклонить документ.")
            return False
        doc.status = new_status
        print(f"{'✅ Утверждён' if new_status == 'Утверждён' else '❌ Отклонён'} документ '{doc.title}'.")
        return True

    elif old == "Отклонён" and new_status == "Черновик":
        doc.status = new_status
        doc.approver = None
        print(f"✏️ Документ '{doc.title}' возвращён в черновик для доработки.")
        return True

    else:
        print(f"⚠️ Невозможно перевести документ из статуса '{old}' в '{new_status}'.")
        return False

# ---------------------- Интерфейс пользователя (консоль) ----------------------
def main_menu():
    while True:
        print("\n" + "="*50)
        print("       ЭЛЕКТРОННЫЙ ДОКУМЕНТООБОРОТ (консоль)")
        print("="*50)
        print("1. Добавить документ")
        print("2. Список документов")
        print("3. Отправить документ на согласование")
        print("4. Утвердить/отклонить документ (действие согласующего)")
        print("5. Вернуть отклонённый документ в черновик (автор)")
        print("0. Выход")
        choice = input("Ваш выбор: ").strip()

        if choice == "1":
            title = input("Название документа: ").strip()
            if not title:
                print("Название не может быть пустым.")
                continue
            author = input("Имя автора: ").strip()
            add_document(title, author)

        elif choice == "2":
            list_documents()

        elif choice == "3":
            list_documents()
            doc_id = input("Введите ID документа для отправки на согласование: ").strip()
            approver = input("Имя согласующего: ").strip()
            if not approver:
                print("Нужно указать согласующего.")
                continue
            change_status(doc_id, "На согласовании", approver_name=approver)

        elif choice == "4":
            list_documents()
            doc_id = input("Введите ID документа (который в статусе 'На согласовании'): ").strip()
            decision = input("Утвердить (д/Утвердить) или Отклонить (н/Отклонить)? ").strip().lower()
            new_status = None
            if decision in ["д", "утвердить", "yes", "y"]:
                new_status = "Утверждён"
            elif decision in ["н", "отклонить", "no", "n"]:
                new_status = "Отклонён"
            else:
                print("Неверный ввод.")
                continue
            # Роль пользователя - согласующий (упрощённо спрашиваем имя)
            approver_name = input("Ваше имя (согласующий): ").strip()
            change_status(doc_id, new_status, user_role="approver", approver_name=None)  # имя согласующего уже хранится

        elif choice == "5":
            list_documents()
            doc_id = input("Введите ID отклонённого документа для возврата в черновик: ").strip()
            change_status(doc_id, "Черновик")

        elif choice == "0":
            print("Выход из программы.")
            break
        else:
            print("Неверный пункт меню.")

if __name__ == "__main__":
    # Небольшой демо-пример: предсоздадим один документ для наглядности
    add_document("Договор поставки", "Иванов И.И.")
    main_menu()