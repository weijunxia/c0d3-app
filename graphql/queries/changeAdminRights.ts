import { gql } from 'apollo-boost'

const CHANGE_ADMIN_RIGHTS = gql`
  mutation changeAdminRights($id: Int!, $status: String!) {
    changeAdminRights(id: $id, status: $status) {
      success
    }
  }
`

export default CHANGE_ADMIN_RIGHTS
