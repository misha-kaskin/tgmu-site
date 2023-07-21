import "./styles.css";
import React from "react";

export class App extends React.Component {
  state = {};

  constructor(props) {
    super(props);

    const lectMap = new Map([['Лекция', [
      { title: "Математика", files: [] },
      { title: "Физика", files: [] },
      { title: "Компьтер сайнс", files: [] }
    ]]]);
    const modMap = new Map([['1 модуль', lectMap]]);
    const subjectMap = new Map([['Анатомия', modMap]]);
    const semMap = new Map([['1 семестр', subjectMap]]);
    const courseMap = new Map([['1 курс', semMap]]);
    const newMap = new Map([['Лечебный факультет', courseMap]]);

    let tmp = newMap.get('Лечебный факультет');
    tmp = tmp.get('1 курс').set('2 семестр', new Map());
    tmp = tmp.get('2 семестр').set('Анатомия', new Map());
    tmp = tmp.get('Анатомия').set('1 модуль', new Map());
    tmp = tmp.get('1 модуль').set('Лекция', [
      { title: "Медицина", files: [] },
      { title: "Колдунство", files: [] }
    ]);

    const flagMap = new Map();

    for (let facultyKey of newMap.keys()) {
      let varFaculty = newMap.get(facultyKey);
      let mapFaculty = new Map();
      flagMap.set(facultyKey, mapFaculty);

      for (let courseKey of varFaculty.keys()) {
        let varCourse = varFaculty.get(courseKey);
        let mapCourse = new Map();
        mapFaculty.set(courseKey, mapCourse);

        for (let semKey of varCourse.keys()) {
          let varSem = varCourse.get(semKey);
          let mapSem = new Map();
          mapCourse.set(semKey, { flag: false, data: mapSem });

          for (let subjKey of varSem.keys()) {
            let varSubj = varSem.get(subjKey);
            let mapSubj = new Map();
            mapSem.set(subjKey, {
              flag: false,
              isAdded: false,
              isDeleted: false,
              sourceVar: subjKey,
              isEdited: false,
              isEdititing: false,
              editedVar: subjKey,
              data: mapSubj
            });

            for (let modKey of varSubj.keys()) {
              let varMod = varSubj.get(modKey);
              let mapMod = new Map();
              mapSubj.set(modKey, {
                flag: false,
                isAdded: false,
                isDeleted: false,
                data: mapMod
              });

              for (let lectKey of varMod.keys()) {
                let titles = [];
                mapMod.set(lectKey, { flag: false, data: titles });

                for (let title of varMod.get(lectKey)) {
                  titles.push({
                    isAdded: false,
                    isDeleted: false,
                    var: title.title,
                    isEdited: false,
                    isEditing: false,
                    editedVar: title.title,
                    files: title.files,
                    flag: false
                  });
                }
              }
            }
          }
        }
      }
    }

    console.log(flagMap);

    this.state = {
      courses: [2, 3, 4, 5, 6],

      dataMap: newMap,
      flags: flagMap,
      files: []
    };
  }

  checkModules(modMap) {
    let result = false;

    for (let module of modMap.values()) {
      result = result || module.flag;
    }

    return result;
  }

  anatomyHandler = () => {
    const isAnatomy = this.state.isShowAnatomy;

    this.setState({ isShowAnatomy: !isAnatomy });

    fetch('http://localhost:8080/data/Лечебный факультет/1/1/1/Лекция')
      .then(response => response.json())
      .then(data => this.setState({ data: data }));
  }

  someHandler = (el) => {
    el.flag = !el.flag;

    const flagMap = new Map(this.state.flags);
    this.setState({ flags: flagMap });
  }

  handleDrop = (e) => {
    e.preventDefault();
    let files = [...e.dataTransfer.files];
    let fileTitles = files.map(el => el.name);
    let currentFiles = [...this.state.files];

    for (let file of fileTitles) {
      currentFiles.push(file);
    }

    this.setState({ files: currentFiles });
  }

  deleteFileHanlder = (idx) => {
    let currentFiles = [...this.state.files];
    let files = currentFiles.filter((el, index) => idx != index);

    this.setState({ files: files });
  }

  handleTotalDrop = (e) => {
    e.preventDefault();
  }


  handleAddModule = (subj, moduleNum) => {
    const moduleMap = new Map();
    subj.set(moduleNum.toString() + ' модуль', {
      flag: false,
      isAdded: true,
      isDeleted: false,
      data: moduleMap
    });
    moduleMap.set('Лекция', { flag: false, data: [] });
    moduleMap.set('Семинар', { flag: false, data: [] });

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleAddSunjTitleByKey = (e) => {
    if (e.keyCode === 27) {
      e.target.value = "";
      return;
    }

    if (e.keyCode === 13) {
      e.target.blur();
    }
  }

  handleAddSubjTitle = (e, lect) => {
    const title = e.target.value;
    e.target.value = "";


    if (!(!title || /^\s*$/.test(title))) {
      lect.data.push({
        isDeleted: false,
        isAdded: true,
        var: title,
        isEdited: false,
        isEditing: false,
        editedVar: title,
        files: []
      });
      const newMap = new Map(this.state.flags);
      this.setState({ flags: newMap });
    }
  }

  handleAddSubjByKey = (e) => {
    if (e.keyCode === 27) {
      e.target.value = "";
      return;
    }

    if (e.keyCode === 13) {
      e.target.blur();
    }
  }

  handleAddSubj = (e, sem) => {
    const title = e.target.value;
    e.target.value = "";

    if (!(!title || /^\s*$/.test(title)) && !sem.data.has(title)) {
      const subjMap = new Map();
      sem.data.set(title, {
        flag: false,
        isAdded: true,
        isEdited: false,
        isDeleted: false,
        isEditing: false,
        sourceVar: title,
        editedVar: title,
        data: subjMap
      });

      const modMap = new Map();
      subjMap.set('1 модуль', { flag: false, data: modMap });

      modMap.set('Лекция', { flag: false, data: [] })
      modMap.set('Семинар', { flag: false, data: [] });

      const newMap = new Map(this.state.flags);
      this.setState({ flags: newMap });
    }
  }

  handleDeleteTitle = (title) => {
    title.isDeleted = true;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }


  handleCancelDeleteTitle = (title) => {
    title.isDeleted = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }


  handleDeleteModule = (mod) => {
    mod.isDeleted = true;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }


  handleCancelDeleteModule = (mod) => {
    mod.isDeleted = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleDeleteSubj = (subj) => {
    subj.isDeleted = true;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleCancelDeleteSubj = (subj) => {
    subj.isDeleted = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditTitleByButton = (title) => {
    title.isEditing = true;
    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditTitle = (e, title) => {
    const str = e.target.value;
    e.target.value = "";

    if (!(!str || /^\s*$/.test(str))) {
      if (title.var === str) {
        title.isEdited = false;

      } else {
        title.isEdited = true;
      }

      title.editedVar = str;
    }

    title.isEditing = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditTitleByKey = (e) => {
    if (e.keyCode === 27) {
      e.target.value = "";
      return;
    }

    if (e.keyCode === 13) {
      e.target.blur();
    }
  }

  handleEditSubjectByButton = (subj) => {
    subj.isEditing = true;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditSubject = (e, subj, sem) => {
    const str = e.target.value;
    e.target.value = "";

    if (!(!str || /^\s*$/.test(str)) && !sem.data.has(str)) {
      if (subj.sourceVar === str) {
        subj.isEdited = false;
      } else {
        subj.isEdited = true;
      }

      subj.editedVar = str;
    }

    subj.isEditing = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditSubjectByKey = (e) => {
    if (e.keyCode === 27) {
      e.target.value = "";
      return;
    }

    if (e.keyCode === 13) {
      e.target.blur();
    }
  }

  handleDropFile = (e, title) => {
    e.preventDefault();
    let files = [...e.dataTransfer.files];
    let currentFiles = title.files;
    title.flag = true;

    for (let file of files) {
      currentFiles.push(file);
    }

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleDeleteFile = (title, idx) => {
    let currentFiles = title.files;
    let files = currentFiles.filter((el, index) => idx != index);
    title.files = files;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleTotalDrop = (e) => {
    e.preventDefault();
  }

  checkTitles(lectMap) {
    let result = false;

    for (let title of lectMap) {
      result = result || (title.flag && title.files.length > 0);
    }

    return result;
  }


  render() {
    return (

      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        border: "1px solid black",
        height: "98vh"
      }}>
        <div style={{
          width: "200px",
          border: "1px solid black"
        }}>
          <div style={{ border: "1px solid black" }}>
            <h1>Тверской ГМУ</h1>
          </div>
          <div style={{ border: "1px solid black" }}>
            Выберите факультет
          </div>
          <div>
            <ul>
              <li>Лечебный &gt;</li>
              <li>Стоматологический &gt;</li>
              <li>Педиатрический &gt;</li>
              <li>Фармацевтический &gt;</li>
              <li>Клин. психология &gt;</li>
            </ul>
          </div>
        </div>

        <div style={{
          border: "1px solid black",
          flexGrow: 1
        }}>
          <div style={{
            textAlign: "center",
            border: "1px solid black"
          }}>
            <h1>Выберите курс на котором Вы учитесь</h1>
          </div>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <div style={{
              border: "1px solid black"
              , width: "100%"
            }}>
              1 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              2 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              3 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              4 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              5 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              6 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              ГОСы
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              Ординатура
            </div>
          </div>
          <div style={{ border: "1px solid black" }}>
            Нажать чтобы открылась строка
          </div>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            overflowY: "scroll",
            height: "800px"
          }}>
            <div style={{ width: "100%" }}>
              <ul>
                {[...this.state.flags.get('Лечебный факультет').get('1 курс').entries()].map(sem =>
                  <li>
                    <span onClick={() => this.someHandler(sem[1])}>
                      {sem[0]}
                    </span>

                    {sem[1].flag && <ul>
                      {[...sem[1].data.entries()].map(subj =>
                        <li>
                          {(!subj[1].isDeleted && !subj[1].isEditing) &&
                            <span>
                              <span onClick={() => this.someHandler(subj[1])}>
                                {subj[1].editedVar}
                              </span>

                              {!this.checkModules(sem[1].data) &&
                                <span>
                                  <button onClick={() => this.handleDeleteSubj(subj[1])}>X</button>
                                  <button onClick={() => this.handleEditSubjectByButton(subj[1])}>R</button>
                                </span>}
                            </span>}

                          {(!subj[1].isDeleted && subj[1].isEditing) &&
                            <input placeholder={subj[1].editedVar}
                              autoFocus
                              onBlur={(e) => this.handleEditSubject(e, subj[1], sem[1])}
                              onKeyDown={(e) => this.handleEditSubjectByKey(e)}></input>
                          }

                          {subj[1].isDeleted &&
                            <button onClick={() => this.handleCancelDeleteSubj(subj[1])}>Восстановить</button>}

                          {subj[1].flag && <ul>
                            {[...subj[1].data.entries()].map(mod =>
                              <li >
                                {!mod[1].isDeleted &&
                                  <span>
                                    <span onClick={() => this.someHandler(mod[1])}>
                                      {mod[0]}
                                    </span>
                                    {!this.checkModules(subj[1].data) &&
                                      <button onClick={() => this.handleDeleteModule(mod[1])}>X</button>}
                                  </span>}

                                {mod[1].isDeleted &&
                                  <button onClick={() => this.handleCancelDeleteModule(mod[1])}>Восстановить</button>}

                                {mod[1].flag &&
                                  <ul>
                                    {[...mod[1].data.entries()].map(lect =>
                                      <li>
                                        <span onClick={() => this.someHandler(lect[1])}>
                                          {lect[0]}
                                        </span>

                                        {lect[1].flag &&
                                          <ul>
                                            {lect[1].data.map(title =>
                                              <li>

                                                {(!title.isDeleted && !title.isEditing) &&
                                                  <span>
                                                    <span onDrop={(e) => this.handleDropFile(e, title)}
                                                      onDragStart={this.handleTotalDrop}
                                                      onDragLeave={this.handleTotalDrop}
                                                      onDragOver={this.handleTotalDrop}
                                                      onClick={() => this.someHandler(title)}>
                                                      {title.editedVar}
                                                    </span>

                                                    {!this.checkTitles(lect[1].data) && <button onClick={() => this.handleDeleteTitle(title)}>Х</button>}

                                                    {!this.checkTitles(lect[1].data) && <button onClick={() => this.handleEditTitleByButton(title)}>R</button>}
                                                    {title.flag && <ul style={{ listStyleType: "none" }}>
                                                      {title.files.map((el, idx) =>
                                                        <li>
                                                          <div style={{
                                                            display: "flex",
                                                            alignItems: "center"
                                                          }}>
                                                            <img height="32px" src="https://clck.ru/353YQL" />
                                                            {el.name}
                                                            <button onClick={() => this.handleDeleteFile(title, idx)}>X</button>
                                                          </div>
                                                        </li>)}
                                                    </ul>}
                                                  </span>}

                                                {(!title.isDeleted && title.isEditing) &&
                                                  <span>
                                                    <input onBlur={(e) => this.handleEditTitle(e, title)}
                                                      placeholder={title.editedVar}
                                                      autoFocus
                                                      onKeyDown={(e) => this.handleEditTitleByKey(e)}></input>
                                                  </span>}

                                                {title.isDeleted &&
                                                  <button onClick={() => this.handleCancelDeleteTitle(title)}>Восстановить</button>}
                                              </li>)}

                                            {!this.checkTitles(lect[1].data) &&
                                              <li>
                                                <input onBlur={(e) => this.handleAddSubjTitle(e, lect[1])}
                                                  onKeyDown={(e) => this.handleAddSunjTitleByKey(e)}
                                                  placeholder="Добавить Название"></input>
                                              </li>}

                                          </ul>}
                                      </li>)}
                                  </ul>}
                              </li>)}

                            {!this.checkModules(subj[1].data) &&
                              <li>
                                <button onClick={() => this.handleAddModule(subj[1].data, subj[1].data.size + 1)}> Добавить </button>
                              </li>}
                          </ul>}
                        </li>)}

                      {!this.checkModules(sem[1].data) &&
                        <li>
                          <input onBlur={(e) => this.handleAddSubj(e, sem[1])}
                            onKeyDown={(e) => this.handleAddSubjByKey(e)}
                            placeholder="Добавить Предмет"></input>
                        </li>}
                    </ul>}
                  </li>)}
              </ul>
            </div>

            {this.state.courses.map((el, idx) =>
              <div style={{ width: "100%" }}>
                <ul>
                  <li>1 семестр</li>
                  <li>2 семестр</li>
                </ul>
              </div>)}
            <div style={{ width: "100%" }}>
              <ul>
                <li>
                  <span
                    onDrop={(e) => this.handleDrop(e)}
                    onDragStart={this.handleTotalDrop}
                    onDragLeave={this.handleTotalDrop}
                    onDragOver={this.handleTotalDrop}>
                    тесты
                  </span>
                  <ul>
                    {this.state.files.map((el, idx) => <li style={{ listStyleType: "none" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%"
                      }}>
                        <img height="32px" src="https://clck.ru/353YQL" />{el}
                        <button style={{ backgroundColor: "transparent", borderColor: "transparent" }} onClick={() => this.deleteFileHanlder(idx)}>
                          <img src="https://clck.ru/353YcR" height="12px"></img>
                        </button>
                      </div>
                    </li>)}
                  </ul>
                </li>
                <li>задачи</li>
              </ul>
            </div>
            <div style={{ width: "100%" }}></div>
          </div>
        </div>
      </div>

    );
  }
}
